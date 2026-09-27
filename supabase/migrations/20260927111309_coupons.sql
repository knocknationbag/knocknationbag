-- ============================================================================
-- coupons
--
--   1. coupons              — admin-managed codes: percentage, flat, free shipping
--   2. coupon_redemptions   — one row per order that used a coupon
--   3. orders / carts       — coupon columns
--   4. coupon_quote()       — the ONLY place coupon eligibility and the discount
--                             are calculated; the cart, checkout and
--                             create_order() all call it
--   5. create_order()       — same signature, now applies a coupon under a row
--                             lock and refuses any discount not from a coupon
--   6. refresh_coupon_reservation() — "Pay now" retry keeps (or loses) the hold
--   7. trigger              — redemption follows the order: paid → redeemed,
--                             cancelled → released
--
-- Usage counting. A limited coupon must not be over-used when two checkouts
-- run at once, nor stay used by an online order that is never paid:
--
--   COD order placed        → redemption "redeemed" at once (the order is a
--                             commitment, exactly as stock is taken at once)
--   Online order placed     → "reserved" for 30 minutes (counts toward limits
--                             while it lasts, so a concurrent checkout cannot
--                             take the last use); becomes "redeemed" when
--                             mark_order_paid() records the payment
--   Reservation lapses      → stops counting; "Pay now" re-checks and renews it
--                             only if the coupon still has room
--   Order cancelled         → "released", the use is given back
--
-- create_order() takes the coupon row lock before counting, so concurrent
-- orders for the same coupon are serialised and the limit holds exactly.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Coupons
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  id                       uuid primary key default gen_random_uuid(),
  code                     text           not null,
  description              text,
  discount_type            text           not null,
  discount_value           numeric(10, 2) not null default 0,
  min_order_amount         numeric(10, 2),
  max_discount_amount      numeric(10, 2),
  expires_at               timestamptz,
  usage_limit              integer,
  usage_limit_per_customer integer,
  is_active                boolean        not null default true,
  archived_at              timestamptz,
  created_at               timestamptz    not null default now(),
  updated_at               timestamptz    not null default now(),

  -- Stored upper-case so SAVE10 and save10 are one code.
  constraint coupons_code_format     check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
  constraint coupons_type_check      check (discount_type in ('percentage', 'flat', 'free_shipping')),
  constraint coupons_value_check     check (
    (discount_type = 'percentage'    and discount_value > 0 and discount_value <= 100) or
    (discount_type = 'flat'          and discount_value > 0) or
    (discount_type = 'free_shipping' and discount_value = 0)
  ),
  constraint coupons_min_order_check check (min_order_amount is null or min_order_amount >= 0),
  constraint coupons_max_check       check (max_discount_amount is null or max_discount_amount > 0),
  constraint coupons_limit_check     check (usage_limit is null or usage_limit >= 1),
  constraint coupons_per_customer_check check (usage_limit_per_customer is null or usage_limit_per_customer >= 1),
  constraint coupons_description_length check (description is null or length(description) <= 200)
);

comment on table public.coupons is 'Discount codes. Admin-only; customers never read this table — the server quotes a code through coupon_quote().';
comment on column public.coupons.archived_at is 'Archived coupons cannot be used and are hidden from the default list. Kept because orders reference them.';

create unique index if not exists coupons_code_key on public.coupons (code);
create index        if not exists coupons_active_idx on public.coupons (is_active, archived_at);

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();

alter table public.coupons enable row level security;

drop policy if exists "coupons: admin all" on public.coupons;
create policy "coupons: admin all"
  on public.coupons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- anon: nothing. A readable coupons table would publish every code.
revoke all on public.coupons from anon;
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;

-- ---------------------------------------------------------------------------
-- 2. Redemptions
-- ---------------------------------------------------------------------------
create table if not exists public.coupon_redemptions (
  id                uuid primary key default gen_random_uuid(),
  -- restrict: a coupon that has been used is archived, never deleted.
  coupon_id         uuid           not null references public.coupons (id) on delete restrict,
  order_id          uuid           not null references public.orders (id) on delete cascade,
  user_id           uuid           references auth.users (id) on delete set null,
  email             text           not null,
  discount          numeric(10, 2) not null default 0,
  shipping_discount numeric(10, 2) not null default 0,
  status            text           not null,
  reserved_until    timestamptz,
  redeemed_at       timestamptz,
  released_at       timestamptz,
  created_at        timestamptz    not null default now(),
  updated_at        timestamptz    not null default now(),

  constraint coupon_redemptions_status_check  check (status in ('reserved', 'redeemed', 'released')),
  constraint coupon_redemptions_amounts_check check (discount >= 0 and shipping_discount >= 0)
);

create unique index if not exists coupon_redemptions_order_key   on public.coupon_redemptions (order_id);
create index        if not exists coupon_redemptions_coupon_idx  on public.coupon_redemptions (coupon_id, status);
create index        if not exists coupon_redemptions_user_idx    on public.coupon_redemptions (coupon_id, user_id) where user_id is not null;
create index        if not exists coupon_redemptions_email_idx   on public.coupon_redemptions (coupon_id, lower(email));

drop trigger if exists coupon_redemptions_set_updated_at on public.coupon_redemptions;
create trigger coupon_redemptions_set_updated_at before update on public.coupon_redemptions
  for each row execute function public.set_updated_at();

alter table public.coupon_redemptions enable row level security;

drop policy if exists "coupon_redemptions: admin read" on public.coupon_redemptions;
create policy "coupon_redemptions: admin read"
  on public.coupon_redemptions for select to authenticated using (public.is_admin());

-- Written only by create_order(), refresh_coupon_reservation() and the trigger.
revoke all on public.coupon_redemptions from anon;
revoke insert, update, delete, truncate on public.coupon_redemptions from authenticated;
grant select on public.coupon_redemptions to authenticated;
grant all on public.coupon_redemptions to service_role;

-- ---------------------------------------------------------------------------
-- 3. Orders and carts
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists coupon_id         uuid references public.coupons (id) on delete set null,
  add column if not exists coupon_code       text,
  add column if not exists shipping_discount numeric(10, 2) not null default 0;

alter table public.orders drop constraint if exists orders_shipping_discount_check;
alter table public.orders add constraint orders_shipping_discount_check check (shipping_discount >= 0);

comment on column public.orders.discount is 'Item discount from the coupon (coupon_code). Subtracted from subtotal before GST.';
comment on column public.orders.shipping_discount is 'Shipping waived by a free-shipping coupon. shipping_fee is what was charged after it.';

create index if not exists orders_coupon_idx on public.orders (coupon_id) where coupon_id is not null;

-- The code a visitor applied in the cart. Carts are service-role only.
alter table public.carts add column if not exists coupon_code text;

-- ---------------------------------------------------------------------------
-- 4. coupon_quote — eligibility + discount, one definition.
--
-- status: valid | invalid | disabled | expired | empty | min_order |
--         usage_limit | customer_limit
--
-- "Customer" is the signed-in account and/or the email address: a signed-in
-- customer's guest orders under the same email count too, so checking out as
-- a guest does not reset a per-customer limit.
--
-- p_lock takes the coupon row lock (create_order). p_exclude_order leaves an
-- order's own redemption out of the count (refresh_coupon_reservation).
-- ---------------------------------------------------------------------------
create or replace function public.coupon_quote(
  p_code          text,
  p_user_id       uuid,
  p_email         text,
  p_subtotal      numeric,
  p_shipping_fee  numeric,
  p_lock          boolean default false,
  p_exclude_order uuid    default null
)
returns table (
  status            text,
  coupon_id         uuid,
  code              text,
  discount_type     text,
  discount          numeric,
  shipping_discount numeric,
  min_order_amount  numeric
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_variable
declare
  c          public.coupons%rowtype;
  v_code     text    := upper(btrim(coalesce(p_code, '')));
  v_email    text    := lower(nullif(btrim(coalesce(p_email, '')), ''));
  v_subtotal numeric := coalesce(p_subtotal, 0);
  v_used     integer;
  v_mine     integer;
  v_discount numeric := 0;
  v_ship     numeric := 0;
begin
  if v_code = '' then
    return query select 'invalid'::text, null::uuid, v_code, null::text, 0::numeric, 0::numeric, null::numeric;
    return;
  end if;

  if p_lock then
    select * into c from public.coupons cp where cp.code = v_code for update;
  else
    select * into c from public.coupons cp where cp.code = v_code;
  end if;

  if not found or c.archived_at is not null then
    return query select 'invalid'::text, null::uuid, v_code, null::text, 0::numeric, 0::numeric, null::numeric;
    return;
  end if;

  if not c.is_active then
    return query select 'disabled'::text, c.id, c.code, c.discount_type, 0::numeric, 0::numeric, c.min_order_amount;
    return;
  end if;
  if c.expires_at is not null and c.expires_at <= now() then
    return query select 'expired'::text, c.id, c.code, c.discount_type, 0::numeric, 0::numeric, c.min_order_amount;
    return;
  end if;
  if v_subtotal <= 0 then
    return query select 'empty'::text, c.id, c.code, c.discount_type, 0::numeric, 0::numeric, c.min_order_amount;
    return;
  end if;
  if c.min_order_amount is not null and v_subtotal < c.min_order_amount then
    return query select 'min_order'::text, c.id, c.code, c.discount_type, 0::numeric, 0::numeric, c.min_order_amount;
    return;
  end if;

  select (count(*))::integer,
         (count(*) filter (where (p_user_id is not null and r.user_id = p_user_id)
                              or (v_email is not null and lower(r.email) = v_email)))::integer
    into v_used, v_mine
    from public.coupon_redemptions r
   where r.coupon_id = c.id
     and (p_exclude_order is null or r.order_id <> p_exclude_order)
     and (r.status = 'redeemed' or (r.status = 'reserved' and r.reserved_until > now()));

  if c.usage_limit is not null and v_used >= c.usage_limit then
    return query select 'usage_limit'::text, c.id, c.code, c.discount_type, 0::numeric, 0::numeric, c.min_order_amount;
    return;
  end if;
  if c.usage_limit_per_customer is not null and (p_user_id is not null or v_email is not null)
     and v_mine >= c.usage_limit_per_customer then
    return query select 'customer_limit'::text, c.id, c.code, c.discount_type, 0::numeric, 0::numeric, c.min_order_amount;
    return;
  end if;

  if c.discount_type = 'percentage' then
    v_discount := round(v_subtotal * c.discount_value / 100, 2);
  elsif c.discount_type = 'flat' then
    v_discount := c.discount_value;
  end if;
  if c.max_discount_amount is not null then
    v_discount := least(v_discount, c.max_discount_amount);
  end if;
  -- A discount can make the items free, never negative.
  v_discount := least(v_discount, v_subtotal);

  if c.discount_type = 'free_shipping' then
    v_ship := greatest(coalesce(p_shipping_fee, 0), 0);
  end if;

  return query select 'valid'::text, c.id, c.code, c.discount_type, v_discount, v_ship, c.min_order_amount;
end;
$$;

revoke execute on function public.coupon_quote(text, uuid, text, numeric, numeric, boolean, uuid) from public, anon, authenticated;
grant execute on function public.coupon_quote(text, uuid, text, numeric, numeric, boolean, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 5. create_order — unchanged contract, plus coupons.
--
-- The caller (lib/checkout, service role) sends the totals it computed from
-- coupon_quote(). Here the coupon is locked and quoted again inside the
-- transaction; if anything differs — the limit was reached a moment ago, the
-- admin disabled it — the order is refused rather than placed at a price the
-- customer was not shown. A discount without a coupon is refused outright.
-- ---------------------------------------------------------------------------
create or replace function public.create_order(p_order jsonb, p_items jsonb, p_deduct_stock boolean)
returns table (order_id uuid, order_number text, access_token uuid)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  item        jsonb;
  available   integer;
  v_order     public.orders%rowtype;
  v_code      text    := upper(btrim(coalesce(p_order ->> 'coupon_code', '')));
  v_discount  numeric := coalesce((p_order ->> 'discount')::numeric, 0);
  v_ship_disc numeric := coalesce((p_order ->> 'shipping_discount')::numeric, 0);
  v_user      uuid    := nullif(p_order ->> 'user_id', '')::uuid;
  v_coupon_id uuid;
  v_coupon    text;
  q           record;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER' using errcode = 'P0001';
  end if;

  -- Coupon first: one lock order (coupon, then stock) for every checkout.
  if v_code <> '' then
    select * into q from public.coupon_quote(
      v_code, v_user, p_order ->> 'email',
      (p_order ->> 'subtotal')::numeric,
      (p_order ->> 'shipping_fee')::numeric + v_ship_disc,
      true, null
    );
    if q.status <> 'valid' then
      raise exception 'COUPON:%', q.status using errcode = 'P0001';
    end if;
    if q.discount <> v_discount or q.shipping_discount <> v_ship_disc then
      raise exception 'COUPON_CHANGED' using errcode = 'P0001';
    end if;
    v_coupon_id := q.coupon_id;
    v_coupon    := q.code;
  elsif v_discount <> 0 or v_ship_disc <> 0 then
    raise exception 'INVALID_DISCOUNT' using errcode = 'P0001';
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    if item ->> 'variant_id' is not null then
      select v.stock into available
        from public.product_variants v
        join public.products p on p.id = v.product_id
       where v.id = (item ->> 'variant_id')::uuid
         and v.product_id = (item ->> 'product_id')::uuid
         and v.is_active and p.status = 'Published'
         for update of v;
    else
      select p.stock into available
        from public.products p
       where p.id = (item ->> 'product_id')::uuid and p.status = 'Published'
         for update;
    end if;

    if available is null then
      raise exception 'UNAVAILABLE:%', item ->> 'product_name' using errcode = 'P0001';
    end if;
    if available < (item ->> 'quantity')::integer then
      raise exception 'OUT_OF_STOCK:%', item ->> 'product_name' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.orders (
    user_id, customer_name, email, phone, shipping_address, billing_address,
    payment_method, payment_status, subtotal, discount, shipping_fee,
    gst_rate, gst_amount, prices_include_gst, total, is_wholesale, stock_deducted, customer_note,
    coupon_id, coupon_code, shipping_discount
  ) values (
    v_user,
    p_order ->> 'customer_name', p_order ->> 'email', p_order ->> 'phone',
    p_order -> 'shipping_address', p_order -> 'billing_address',
    p_order ->> 'payment_method', p_order ->> 'payment_status',
    (p_order ->> 'subtotal')::numeric, v_discount,
    (p_order ->> 'shipping_fee')::numeric, (p_order ->> 'gst_rate')::numeric,
    (p_order ->> 'gst_amount')::numeric, (p_order ->> 'prices_include_gst')::boolean,
    (p_order ->> 'total')::numeric, coalesce((p_order ->> 'is_wholesale')::boolean, false),
    p_deduct_stock, nullif(p_order ->> 'customer_note', ''),
    v_coupon_id, v_coupon, v_ship_disc
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, variant_id, product_name, product_slug, variant_label, sku,
    image_url, unit_price, quantity, line_total, is_wholesale_price
  )
  select v_order.id, (i ->> 'product_id')::uuid, nullif(i ->> 'variant_id', '')::uuid,
         i ->> 'product_name', i ->> 'product_slug', i ->> 'variant_label', i ->> 'sku',
         i ->> 'image_url', (i ->> 'unit_price')::numeric, (i ->> 'quantity')::integer,
         (i ->> 'line_total')::numeric, coalesce((i ->> 'is_wholesale_price')::boolean, false)
    from jsonb_array_elements(p_items) i;

  if p_deduct_stock then
    for item in select * from jsonb_array_elements(p_items) loop
      if item ->> 'variant_id' is not null then
        update public.product_variants set stock = stock - (item ->> 'quantity')::integer
         where id = (item ->> 'variant_id')::uuid;
      else
        update public.products set stock = stock - (item ->> 'quantity')::integer
         where id = (item ->> 'product_id')::uuid;
      end if;
    end loop;
  end if;

  if v_coupon_id is not null then
    insert into public.coupon_redemptions (
      coupon_id, order_id, user_id, email, discount, shipping_discount, status, reserved_until, redeemed_at
    ) values (
      v_coupon_id, v_order.id, v_user, v_order.email, v_discount, v_ship_disc,
      case when v_order.payment_method = 'online' then 'reserved' else 'redeemed' end,
      case when v_order.payment_method = 'online' then now() + interval '30 minutes' end,
      case when v_order.payment_method = 'online' then null else now() end
    );
  end if;

  return query select v_order.id, v_order.order_number, v_order.access_token;
end;
$$;

revoke execute on function public.create_order(jsonb, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- 6. refresh_coupon_reservation — called before opening Razorpay.
--
-- Returns 'none' (no coupon on the order) or 'ok'. Raises COUPON_UNAVAILABLE
-- when the hold lapsed and the coupon has since run out, expired or been
-- disabled — the order can then no longer be paid at its discounted total.
-- ---------------------------------------------------------------------------
create or replace function public.refresh_coupon_reservation(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.coupon_redemptions%rowtype;
  o public.orders%rowtype;
  q record;
begin
  select * into r from public.coupon_redemptions where order_id = p_order_id for update;
  if not found then
    return 'none';
  end if;
  if r.status = 'redeemed' then
    return 'ok';
  end if;
  if r.status = 'released' then
    raise exception 'COUPON_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if r.reserved_until is null or r.reserved_until <= now() then
    select * into o from public.orders where id = p_order_id;
    select * into q from public.coupon_quote(
      (select c.code from public.coupons c where c.id = r.coupon_id),
      o.user_id, o.email, o.subtotal, o.shipping_fee + o.shipping_discount, true, p_order_id
    );
    if q.status <> 'valid' then
      raise exception 'COUPON_UNAVAILABLE' using errcode = 'P0001';
    end if;
  end if;

  update public.coupon_redemptions set reserved_until = now() + interval '30 minutes' where id = r.id;
  return 'ok';
end;
$$;

revoke execute on function public.refresh_coupon_reservation(uuid) from public, anon, authenticated;
grant execute on function public.refresh_coupon_reservation(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 7. Redemption follows the order.
--
-- A trigger rather than edits to mark_order_paid() / update_order_status():
-- those stay exactly as tested, and every route that pays or cancels an order
-- (browser verification, webhook, dashboard) is covered by one rule.
-- ---------------------------------------------------------------------------
create or replace function public.orders_sync_coupon_redemption()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.coupon_id is null then
    return null;
  end if;

  if new.status = 'Cancelled' and old.status is distinct from 'Cancelled' then
    update public.coupon_redemptions
       set status = 'released', released_at = now(), reserved_until = null
     where order_id = new.id and status <> 'released';
  elsif new.payment_status = 'paid' and old.payment_status is distinct from 'paid' and new.status <> 'Cancelled' then
    update public.coupon_redemptions
       set status = 'redeemed', redeemed_at = coalesce(redeemed_at, now()), reserved_until = null
     where order_id = new.id and status <> 'redeemed';
  end if;
  return null;
end;
$$;

drop trigger if exists orders_sync_coupon_redemption on public.orders;
create trigger orders_sync_coupon_redemption
  after update of status, payment_status on public.orders
  for each row execute function public.orders_sync_coupon_redemption();

revoke execute on function public.orders_sync_coupon_redemption() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Dashboard: live use counts per coupon (redeemed + holds still running).
-- ---------------------------------------------------------------------------
create or replace function public.coupon_usage_counts()
returns table (coupon_id uuid, redeemed integer, reserved integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can read coupon usage.' using errcode = 'insufficient_privilege';
  end if;
  return query
    select r.coupon_id,
           (count(*) filter (where r.status = 'redeemed'))::integer,
           (count(*) filter (where r.status = 'reserved' and r.reserved_until > now()))::integer
      from public.coupon_redemptions r
     group by r.coupon_id;
end;
$$;

revoke execute on function public.coupon_usage_counts() from public, anon;
grant execute on function public.coupon_usage_counts() to authenticated;
