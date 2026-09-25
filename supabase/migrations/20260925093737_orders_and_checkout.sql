-- ============================================================================
-- orders_and_checkout  (V1 Phase 2)
--
--   1. store_settings       — shipping fee, free-shipping threshold, GST, COD
--   2. carts / cart_items   — server-managed carts (guest + signed-in)
--   3. addresses            — a customer's saved delivery addresses
--   4. orders / order_items — placed orders; items are price snapshots
--   5. create_order()       — atomic: stock check + order + items + stock deduction
--   6. update_order_status()— admin status changes; restock on cancel; COD paid on delivery
--   7. order_stats()        — dashboard numbers
--
-- Money is numeric(10,2) rupees. Totals are computed by the server
-- (lib/checkout) from database prices — never taken from the browser.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Store settings — exactly one row.
-- ---------------------------------------------------------------------------
create table if not exists public.store_settings (
  id                      smallint primary key default 1,
  shipping_fee            numeric(10, 2) not null default 99,
  free_shipping_threshold numeric(10, 2),
  gst_enabled             boolean        not null default true,
  gst_rate                numeric(5, 2)  not null default 18,
  prices_include_gst      boolean        not null default true,
  cod_enabled             boolean        not null default true,
  updated_at              timestamptz    not null default now(),

  constraint store_settings_single_row   check (id = 1),
  constraint store_settings_shipping_fee check (shipping_fee >= 0),
  constraint store_settings_threshold    check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  constraint store_settings_gst_rate     check (gst_rate >= 0 and gst_rate <= 100)
);

comment on table public.store_settings is 'Single-row shop settings, edited from the dashboard Settings screen.';
comment on column public.store_settings.free_shipping_threshold is 'Order subtotal at or above which shipping is free. Null = never free.';

-- Temporary development values; the owner edits them in the dashboard.
insert into public.store_settings (id, shipping_fee, free_shipping_threshold, gst_enabled, gst_rate, prices_include_gst, cod_enabled)
values (1, 99, 1999, true, 18, true, true)
on conflict (id) do nothing;

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

drop policy if exists "store_settings: public read"  on public.store_settings;
drop policy if exists "store_settings: admin update" on public.store_settings;

-- Nothing here is secret: customers see the shipping fee and GST in the cart.
create policy "store_settings: public read"
  on public.store_settings for select to anon, authenticated using (true);

create policy "store_settings: admin update"
  on public.store_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;

-- ---------------------------------------------------------------------------
-- 2. Carts — identified by a random id held in an httpOnly cookie. Only the
-- server (service role) reads or writes them; no API role has access, so a
-- cart id cannot be enumerated or read through the public API.
-- ---------------------------------------------------------------------------
create table if not exists public.carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists carts_user_idx on public.carts (user_id, updated_at desc) where user_id is not null;

create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  cart_id    uuid        not null references public.carts (id) on delete cascade,
  product_id uuid        not null references public.products (id) on delete cascade,
  variant_id uuid        references public.product_variants (id) on delete cascade,
  quantity   integer     not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cart_items_quantity_check check (quantity between 1 and 99)
);

-- One line per product/variant: adding the same bag again raises the quantity.
create unique index if not exists cart_items_line_key
  on public.cart_items (cart_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at before update on public.carts
  for each row execute function public.set_updated_at();
drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at before update on public.cart_items
  for each row execute function public.set_updated_at();

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
revoke all on public.carts, public.cart_items from anon, authenticated;
grant all on public.carts, public.cart_items to service_role;

-- ---------------------------------------------------------------------------
-- 3. Saved addresses (signed-in customers).
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  full_name  text        not null,
  phone      text        not null,
  line1      text        not null,
  line2      text,
  city       text        not null,
  state      text        not null,
  pincode    text        not null,
  country    text        not null default 'India',
  is_default boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint addresses_pincode_check check (pincode ~ '^[1-9][0-9]{5}$'),
  constraint addresses_phone_check   check (phone ~ '^[0-9+ ()-]{8,20}$')
);

create index        if not exists addresses_user_idx     on public.addresses (user_id);
create unique index if not exists addresses_default_key  on public.addresses (user_id) where is_default;

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "addresses: own"        on public.addresses;
drop policy if exists "addresses: admin read" on public.addresses;

create policy "addresses: own"
  on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "addresses: admin read"
  on public.addresses for select to authenticated using (public.is_admin());

revoke all on public.addresses from anon;
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;

-- ---------------------------------------------------------------------------
-- 4. Orders
-- ---------------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 10001;

create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text        not null default ('KNB-' || nextval('public.order_number_seq')),
  -- Unguessable key for the guest confirmation page (/order/<token>).
  access_token       uuid        not null default gen_random_uuid(),
  user_id            uuid        references auth.users (id) on delete set null,

  customer_name      text        not null,
  email              text        not null,
  phone              text        not null,
  shipping_address   jsonb       not null,
  billing_address    jsonb,

  status             text        not null default 'Pending',
  payment_method     text        not null,
  payment_status     text        not null,

  subtotal           numeric(10, 2) not null,
  discount           numeric(10, 2) not null default 0,
  shipping_fee       numeric(10, 2) not null default 0,
  gst_rate           numeric(5, 2)  not null default 0,
  gst_amount         numeric(10, 2) not null default 0,
  prices_include_gst boolean        not null default true,
  total              numeric(10, 2) not null,
  is_wholesale       boolean        not null default false,

  -- True while this order holds stock. Cancelling returns it and clears this.
  stock_deducted     boolean     not null default false,

  tracking_number    text,
  courier            text,
  customer_note      text,

  paid_at            timestamptz,
  shipped_at         timestamptz,
  delivered_at       timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint orders_status_check         check (status in ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  constraint orders_payment_method_check check (payment_method in ('cod', 'online')),
  constraint orders_payment_status_check check (payment_status in ('cod_pending', 'pending', 'paid', 'failed', 'refunded')),
  constraint orders_email_check          check (position('@' in email) > 1),
  constraint orders_amounts_check        check (subtotal >= 0 and discount >= 0 and shipping_fee >= 0 and gst_amount >= 0 and total >= 0)
);

comment on column public.orders.payment_status is
  'cod_pending: cash on delivery, not yet collected. pending/paid/failed/refunded: online payment state, set only from verified gateway results.';

create unique index if not exists orders_number_key       on public.orders (order_number);
create unique index if not exists orders_access_token_key on public.orders (access_token);
create index        if not exists orders_user_idx         on public.orders (user_id, created_at desc);
create index        if not exists orders_status_idx       on public.orders (status, created_at desc);
create index        if not exists orders_created_idx      on public.orders (created_at desc);
create index        if not exists orders_email_idx        on public.orders (lower(email));

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid           not null references public.orders (id) on delete cascade,
  product_id         uuid           references public.products (id) on delete set null,
  variant_id         uuid           references public.product_variants (id) on delete set null,
  -- Snapshot: what was bought, at what price, even if the product changes later.
  product_name       text           not null,
  product_slug       text,
  variant_label      text,
  sku                text,
  image_url          text,
  unit_price         numeric(10, 2) not null,
  quantity           integer        not null,
  line_total         numeric(10, 2) not null,
  is_wholesale_price boolean        not null default false,

  constraint order_items_quantity_check check (quantity > 0),
  constraint order_items_amounts_check  check (unit_price >= 0 and line_total >= 0)
);

create index if not exists order_items_order_idx   on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders: own read"        on public.orders;
drop policy if exists "orders: admin read"      on public.orders;
drop policy if exists "order_items: read"       on public.order_items;

create policy "orders: own read"
  on public.orders for select to authenticated using (user_id = auth.uid());

create policy "orders: admin read"
  on public.orders for select to authenticated using (public.is_admin());

create policy "order_items: read"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
     where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));

-- Orders are written only through create_order() and update_order_status().
revoke all on public.orders, public.order_items from anon;
revoke insert, update, delete, truncate on public.orders, public.order_items from authenticated;
grant select on public.orders, public.order_items to authenticated;
grant all on public.orders, public.order_items to service_role;
grant usage on sequence public.order_number_seq to service_role;

-- ---------------------------------------------------------------------------
-- 5. create_order — the only way an order comes into existence.
--
-- One transaction: lock every product/variant row being bought, confirm it is
-- still Published / active with enough stock, insert the order and its
-- items, and (for COD) deduct stock. Two customers buying the last bag at the
-- same moment cannot both succeed — the second waits on the row lock, then
-- sees the reduced stock and fails with OUT_OF_STOCK.
--
-- Called by the server with the service role after it has computed prices
-- from the database; not callable by customers directly.
-- ---------------------------------------------------------------------------
create or replace function public.create_order(p_order jsonb, p_items jsonb, p_deduct_stock boolean)
returns table (order_id uuid, order_number text, access_token uuid)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  item      jsonb;
  available integer;
  v_order   public.orders%rowtype;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER' using errcode = 'P0001';
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
    gst_rate, gst_amount, prices_include_gst, total, is_wholesale, stock_deducted, customer_note
  ) values (
    nullif(p_order ->> 'user_id', '')::uuid,
    p_order ->> 'customer_name', p_order ->> 'email', p_order ->> 'phone',
    p_order -> 'shipping_address', p_order -> 'billing_address',
    p_order ->> 'payment_method', p_order ->> 'payment_status',
    (p_order ->> 'subtotal')::numeric, coalesce((p_order ->> 'discount')::numeric, 0),
    (p_order ->> 'shipping_fee')::numeric, (p_order ->> 'gst_rate')::numeric,
    (p_order ->> 'gst_amount')::numeric, (p_order ->> 'prices_include_gst')::boolean,
    (p_order ->> 'total')::numeric, coalesce((p_order ->> 'is_wholesale')::boolean, false),
    p_deduct_stock, nullif(p_order ->> 'customer_note', '')
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

  return query select v_order.id, v_order.order_number, v_order.access_token;
end;
$$;

revoke execute on function public.create_order(jsonb, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- 6. update_order_status — admin only.
--
--   Cancelled  → returns held stock (once), stamps cancelled_at. Final: a
--                cancelled order cannot be reopened (re-place it instead).
--   Shipped    → stamps shipped_at.
--   Delivered  → stamps delivered_at; a COD order becomes paid (cash collected).
-- ---------------------------------------------------------------------------
create or replace function public.update_order_status(
  p_order_id uuid, p_status text, p_tracking_number text default null, p_courier text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  item    public.order_items%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can update orders.' using errcode = 'insufficient_privilege';
  end if;
  if p_status not in ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') then
    raise exception 'Unknown order status.' using errcode = 'check_violation';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.' using errcode = 'no_data_found';
  end if;
  if v_order.status = 'Cancelled' and p_status <> 'Cancelled' then
    raise exception 'A cancelled order cannot be reopened.' using errcode = 'check_violation';
  end if;

  if p_status = 'Cancelled' and v_order.status <> 'Cancelled' and v_order.stock_deducted then
    for item in select * from public.order_items where order_id = p_order_id loop
      if item.variant_id is not null then
        update public.product_variants set stock = stock + item.quantity where id = item.variant_id;
      elsif item.product_id is not null and item.variant_label is null then
        update public.products set stock = stock + item.quantity where id = item.product_id;
      end if;
    end loop;
  end if;

  update public.orders set
    status          = p_status,
    tracking_number = coalesce(nullif(btrim(p_tracking_number), ''), tracking_number),
    courier         = coalesce(nullif(btrim(p_courier), ''), courier),
    stock_deducted  = case when p_status = 'Cancelled' then false else stock_deducted end,
    cancelled_at    = case when p_status = 'Cancelled' then coalesce(cancelled_at, now()) else cancelled_at end,
    shipped_at      = case when p_status in ('Shipped', 'Delivered') then coalesce(shipped_at, now()) else shipped_at end,
    delivered_at    = case when p_status = 'Delivered' then coalesce(delivered_at, now()) else delivered_at end,
    payment_status  = case when p_status = 'Delivered' and payment_method = 'cod' and payment_status = 'cod_pending' then 'paid' else payment_status end,
    paid_at         = case when p_status = 'Delivered' and payment_method = 'cod' and payment_status = 'cod_pending' then now() else paid_at end
  where id = p_order_id;
end;
$$;

revoke execute on function public.update_order_status(uuid, text, text, text) from public, anon;
grant execute on function public.update_order_status(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. order_stats — the dashboard's headline numbers. "Today" is India time.
-- Sales = every order that is not cancelled (COD included once placed).
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
    'total_orders',  count(*),
    'today_orders',  count(*) filter (where created_at >= today_start),
    'total_sales',   coalesce(sum(total) filter (where status <> 'Cancelled'), 0),
    'today_sales',   coalesce(sum(total) filter (where status <> 'Cancelled' and created_at >= today_start), 0),
    'pending_orders', count(*) filter (where status = 'Pending'),
    'to_ship',       count(*) filter (where status in ('Confirmed', 'Processing'))
  ) into result
  from public.orders;

  return result;
end;
$$;

revoke execute on function public.order_stats() from public, anon;
grant execute on function public.order_stats() to authenticated;
