-- ============================================================================
-- razorpay_payments  (V1 Phase 3)
--
-- Online payment via Razorpay. An online order is created "pending" without
-- touching stock; it becomes "paid" only through mark_order_paid(), which the
-- server calls after verifying the payment with Razorpay (checkout signature +
-- payment lookup, or a signed webhook). Stock is deducted in that same step.
-- ============================================================================

alter table public.orders
  add column if not exists razorpay_order_id   text,
  add column if not exists razorpay_payment_id text,
  -- Paid, but stock could not be taken (sold out while the customer paid, or
  -- the order was cancelled first). The dashboard flags it for a refund/restock.
  add column if not exists stock_issue         boolean not null default false;

create unique index if not exists orders_razorpay_order_key on public.orders (razorpay_order_id) where razorpay_order_id is not null;

comment on column public.orders.razorpay_order_id is 'Razorpay order (order_...) created for this order''s exact total.';
comment on column public.orders.stock_issue is 'Payment received but stock was unavailable — needs a refund or restock.';

-- ---------------------------------------------------------------------------
-- attach_razorpay_order — remember which Razorpay order belongs to an order.
-- ---------------------------------------------------------------------------
create or replace function public.attach_razorpay_order(p_order_id uuid, p_razorpay_order_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.orders
     set razorpay_order_id = p_razorpay_order_id
   where id = p_order_id and payment_method = 'online' and payment_status in ('pending', 'failed');
$$;

-- ---------------------------------------------------------------------------
-- mark_order_paid — the only way an online order becomes paid.
--
-- Idempotent: the browser verification and the webhook can both arrive, in
-- either order, and the payment is recorded (and stock deducted) once.
-- Returns 'paid', 'already_paid' or 'paid_stock_issue'.
-- ---------------------------------------------------------------------------
create or replace function public.mark_order_paid(p_order_id uuid, p_payment_id text, p_amount_paise bigint)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order   public.orders%rowtype;
  item      public.order_items%rowtype;
  available integer;
  enough    boolean := true;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_order.payment_method <> 'online' then
    raise exception 'NOT_ONLINE_ORDER' using errcode = 'P0001';
  end if;
  if v_order.payment_status in ('paid', 'refunded') then
    return 'already_paid';
  end if;
  if p_amount_paise <> round(v_order.total * 100)::bigint then
    raise exception 'AMOUNT_MISMATCH' using errcode = 'P0001';
  end if;

  -- Take stock now, all or nothing. A cancelled order never takes stock.
  if v_order.status <> 'Cancelled' then
    for item in select * from public.order_items where order_id = p_order_id loop
      available := null;
      if item.variant_id is not null then
        select stock into available from public.product_variants where id = item.variant_id for update;
      elsif item.product_id is not null then
        select stock into available from public.products where id = item.product_id for update;
      end if;
      if available is null or available < item.quantity then
        enough := false;
      end if;
    end loop;
  else
    enough := false;
  end if;

  if enough then
    for item in select * from public.order_items where order_id = p_order_id loop
      if item.variant_id is not null then
        update public.product_variants set stock = stock - item.quantity where id = item.variant_id;
      else
        update public.products set stock = stock - item.quantity where id = item.product_id;
      end if;
    end loop;
  end if;

  update public.orders set
    payment_status      = 'paid',
    paid_at             = now(),
    razorpay_payment_id = p_payment_id,
    stock_deducted      = enough,
    stock_issue         = not enough
  where id = p_order_id;

  return case when enough then 'paid' else 'paid_stock_issue' end;
end;
$$;

-- ---------------------------------------------------------------------------
-- Failed and refunded — never overwrite a better state.
-- ---------------------------------------------------------------------------
create or replace function public.mark_order_payment_failed(p_order_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.orders set payment_status = 'failed'
   where id = p_order_id and payment_method = 'online' and payment_status = 'pending';
$$;

create or replace function public.mark_order_refunded(p_order_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.orders set payment_status = 'refunded'
   where id = p_order_id and payment_method = 'online' and payment_status = 'paid';
$$;

revoke execute on function public.attach_razorpay_order(uuid, text)      from public, anon, authenticated;
revoke execute on function public.mark_order_paid(uuid, text, bigint)     from public, anon, authenticated;
revoke execute on function public.mark_order_payment_failed(uuid)         from public, anon, authenticated;
revoke execute on function public.mark_order_refunded(uuid)               from public, anon, authenticated;
grant execute on function public.attach_razorpay_order(uuid, text)      to service_role;
grant execute on function public.mark_order_paid(uuid, text, bigint)     to service_role;
grant execute on function public.mark_order_payment_failed(uuid)         to service_role;
grant execute on function public.mark_order_refunded(uuid)               to service_role;

-- ---------------------------------------------------------------------------
-- Dashboard numbers: an online order that was never paid is not a sale and
-- needs no action, so it is left out of sales and "pending". COD orders still
-- count from the moment they are placed (unchanged).
-- ---------------------------------------------------------------------------
create or replace function public.order_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today_start timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
  result      jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can read order statistics.' using errcode = 'insufficient_privilege';
  end if;

  select jsonb_build_object(
    'total_orders',   count(*) filter (where committed),
    'today_orders',   count(*) filter (where committed and created_at >= today_start),
    'total_sales',    coalesce(sum(total) filter (where committed and status <> 'Cancelled'), 0),
    'today_sales',    coalesce(sum(total) filter (where committed and status <> 'Cancelled' and created_at >= today_start), 0),
    'pending_orders', count(*) filter (where committed and status = 'Pending'),
    'to_ship',        count(*) filter (where committed and status in ('Confirmed', 'Processing')),
    'awaiting_payment', count(*) filter (where not committed and status <> 'Cancelled')
  ) into result
  from (
    select o.*, (o.payment_method = 'cod' or o.payment_status in ('paid', 'refunded')) as committed
      from public.orders o
  ) o;

  return result;
end;
$$;
