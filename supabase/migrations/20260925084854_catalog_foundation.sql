-- ============================================================================
-- catalog_foundation  (V1 Phase 1)
--
--   1. categories            — owner-managed, one level of subcategories
--   2. products              — category_id, featured flag, material, specs;
--                              stock_status kept in step with stock automatically
--   3. product_variants      — optional, one option (e.g. Colour) per product
--   4. product_trade_prices  — cost + wholesale price, never public
--   5. profiles              — is_wholesale_approved, guarded against self-edit
--   6. wholesale_offers()    — the only way a customer reads wholesale prices
--   7. storage bucket        — `catalog`, public images, admin-only writes
--
-- Data: products.category (free text) is replaced by category_id and dropped.
-- products.cost_price is copied into product_trade_prices before it is dropped
-- (it held no values when this was written). Nothing else is rewritten.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id               uuid primary key default gen_random_uuid(),
  parent_id        uuid references public.categories (id) on delete restrict,
  name             text        not null,
  slug             text        not null,
  description      text,
  image_url        text,
  status           text        not null default 'Active',
  sort_order       integer     not null default 0,
  seo_title        text,
  meta_description text,
  og_image         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint categories_status_check      check (status in ('Active', 'Hidden')),
  constraint categories_slug_format       check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_name_check        check (length(btrim(name)) between 1 and 80),
  constraint categories_not_own_parent    check (parent_id is null or parent_id <> id)
);

comment on table public.categories is 'Product categories. parent_id makes a subcategory; one level deep.';

create unique index if not exists categories_slug_key      on public.categories (slug);
create index        if not exists categories_parent_idx    on public.categories (parent_id);
create index        if not exists categories_status_idx    on public.categories (status, sort_order);

-- One level only: a subcategory's parent must itself be top-level, and a
-- category that has children cannot become a child. Deep trees are where
-- simple catalogues go to become unmanageable.
create or replace function public.categories_enforce_depth()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if exists (select 1 from public.categories c where c.id = new.parent_id and c.parent_id is not null) then
    raise exception 'A subcategory cannot have its own subcategories.' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.categories c where c.parent_id = new.id) then
    raise exception 'A category with subcategories cannot become a subcategory.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists categories_enforce_depth on public.categories;
create trigger categories_enforce_depth
  before insert or update of parent_id on public.categories
  for each row execute function public.categories_enforce_depth();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "categories: public read active" on public.categories;
drop policy if exists "categories: admin read"         on public.categories;
drop policy if exists "categories: admin write"        on public.categories;

create policy "categories: public read active"
  on public.categories for select to anon, authenticated
  using (status = 'Active');

create policy "categories: admin read"
  on public.categories for select to authenticated
  using (public.is_admin());

create policy "categories: admin write"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

-- Starting categories (the owner edits these from the dashboard). Reference
-- data, not demo data: inserted once, never overwritten.
insert into public.categories (name, slug, sort_order) values
  ('Backpacks',       'backpacks',       10),
  ('Laptop Bags',     'laptop-bags',     20),
  ('Office Bags',     'office-bags',     30),
  ('Travel Bags',     'travel-bags',     40),
  ('Duffel Bags',     'duffel-bags',     50),
  ('Sling Bags',      'sling-bags',      60),
  ('Handbags',        'handbags',        70),
  ('Tote Bags',       'tote-bags',       80),
  ('School Bags',     'school-bags',     90),
  ('College Bags',    'college-bags',   100),
  ('Gym Bags',        'gym-bags',       110),
  ('Trolley Bags',    'trolley-bags',   120),
  ('Messenger Bags',  'messenger-bags', 130),
  ('Crossbody Bags',  'crossbody-bags', 140)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Products
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists category_id    uuid references public.categories (id) on delete set null,
  add column if not exists is_featured    boolean not null default false,
  add column if not exists material       text,
  add column if not exists specifications jsonb   not null default '[]'::jsonb;

alter table public.products drop constraint if exists products_specifications_is_array;
alter table public.products add constraint products_specifications_is_array
  check (jsonb_typeof(specifications) = 'array');

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_featured_idx    on public.products (is_featured) where is_featured;

drop index if exists public.products_category_idx;
alter table public.products drop column if exists category;

comment on column public.products.stock is
  'Units on hand. When the product has variants this is the sum of active variant stock, maintained by trigger.';

-- ---------------------------------------------------------------------------
-- 3. Variants — optional. A product without rows here is sold as one item.
-- ---------------------------------------------------------------------------
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid        not null references public.products (id) on delete cascade,
  option_name text        not null default 'Colour',
  value       text        not null,
  sku         text,
  price       numeric(10, 2),
  sale_price  numeric(10, 2),
  stock       integer     not null default 0,
  image_url   text,
  sort_order  integer     not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint product_variants_value_check      check (length(btrim(value)) between 1 and 60),
  constraint product_variants_price_check      check (price is null or price >= 0),
  constraint product_variants_sale_price_check check (sale_price is null or sale_price >= 0),
  constraint product_variants_sale_below_price check (sale_price is null or price is null or sale_price < price),
  constraint product_variants_stock_check      check (stock >= 0)
);

comment on table public.product_variants is
  'Optional sellable options of a product (e.g. colours). price/sale_price override the product when set.';

create unique index if not exists product_variants_value_key on public.product_variants (product_id, lower(value));
create unique index if not exists product_variants_sku_key   on public.product_variants (upper(sku)) where sku is not null;
create index        if not exists product_variants_product_idx on public.product_variants (product_id, sort_order);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- Keep products.stock and products.stock_status honest. The product row is
-- the one place listings, filters and the dashboard read availability from.
create or replace function public.products_derive_stock()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.product_variants v where v.product_id = new.id) then
    select coalesce(sum(v.stock), 0)::integer into new.stock
      from public.product_variants v
     where v.product_id = new.id and v.is_active;
  end if;

  new.stock_status := case
    when new.stock <= 0 then 'Out of stock'
    when new.stock <= new.low_stock_alert then 'Low stock'
    else 'In stock'
  end;
  return new;
end;
$$;

drop trigger if exists products_derive_stock on public.products;
create trigger products_derive_stock
  before insert or update on public.products
  for each row execute function public.products_derive_stock();

-- Any variant change re-saves its product so the trigger above recomputes.
create or replace function public.product_variants_touch_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.products set updated_at = now()
   where id = coalesce(new.product_id, old.product_id);
  if tg_op = 'UPDATE' and new.product_id is distinct from old.product_id then
    update public.products set updated_at = now() where id = old.product_id;
  end if;
  return null;
end;
$$;

drop trigger if exists product_variants_touch_product on public.product_variants;
create trigger product_variants_touch_product
  after insert or update or delete on public.product_variants
  for each row execute function public.product_variants_touch_product();

alter table public.product_variants enable row level security;

drop policy if exists "product_variants: public read" on public.product_variants;
drop policy if exists "product_variants: admin read"  on public.product_variants;
drop policy if exists "product_variants: admin write" on public.product_variants;

create policy "product_variants: public read"
  on public.product_variants for select to anon, authenticated
  using (is_active and exists (
    select 1 from public.products p where p.id = product_id and p.status = 'Published'
  ));

create policy "product_variants: admin read"
  on public.product_variants for select to authenticated
  using (public.is_admin());

create policy "product_variants: admin write"
  on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.product_variants to anon;
grant select, insert, update, delete on public.product_variants to authenticated;
grant all on public.product_variants to service_role;

-- Recompute every existing product once so stock_status matches the new rule.
update public.products set updated_at = updated_at;

-- ---------------------------------------------------------------------------
-- 4. Trade prices — cost and wholesale. Never readable by the public API.
--
-- products is readable by anyone (published rows), so a cost or wholesale
-- column there would be one query away from every visitor. Here only admins
-- can read or write; approved wholesale customers get their prices through
-- wholesale_offers() below.
-- ---------------------------------------------------------------------------
create table if not exists public.product_trade_prices (
  product_id        uuid primary key references public.products (id) on delete cascade,
  cost_price        numeric(10, 2),
  wholesale_price   numeric(10, 2),
  wholesale_min_qty integer,
  updated_at        timestamptz not null default now(),

  constraint product_trade_prices_cost_check      check (cost_price is null or cost_price >= 0),
  constraint product_trade_prices_wholesale_check check (wholesale_price is null or wholesale_price >= 0),
  constraint product_trade_prices_min_qty_check   check (wholesale_min_qty is null or wholesale_min_qty >= 1),
  -- A wholesale price without a minimum (or the reverse) is half an offer.
  constraint product_trade_prices_wholesale_pair  check ((wholesale_price is null) = (wholesale_min_qty is null))
);

comment on table public.product_trade_prices is 'Cost and wholesale pricing. Admin-only; customers read via wholesale_offers().';

drop trigger if exists product_trade_prices_set_updated_at on public.product_trade_prices;
create trigger product_trade_prices_set_updated_at
  before update on public.product_trade_prices
  for each row execute function public.set_updated_at();

insert into public.product_trade_prices (product_id, cost_price)
select id, cost_price from public.products where cost_price is not null
on conflict (product_id) do nothing;

alter table public.products drop column if exists cost_price;

alter table public.product_trade_prices enable row level security;

drop policy if exists "product_trade_prices: admin all" on public.product_trade_prices;
create policy "product_trade_prices: admin all"
  on public.product_trade_prices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- anon: nothing.
grant select, insert, update, delete on public.product_trade_prices to authenticated;
grant all on public.product_trade_prices to service_role;

-- ---------------------------------------------------------------------------
-- 5. Wholesale approval on the customer's profile
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_wholesale_approved boolean not null default false;

comment on column public.profiles.is_wholesale_approved is
  'Set by an admin. Approved, Active customers see and pay wholesale prices at the minimum quantity.';

create index if not exists profiles_wholesale_idx on public.profiles (is_wholesale_approved) where is_wholesale_approved;

-- "profiles: update own" lets a customer edit their own row — correct for a
-- name or phone, but it would also let them approve themselves for wholesale
-- or reactivate a deactivated account. Admin-only columns are guarded here.
-- Server-side roles (service_role, postgres) are trusted callers.
create or replace function public.profiles_guard_admin_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') or public.is_admin() then
    return new;
  end if;
  if new.is_wholesale_approved is distinct from old.is_wholesale_approved
     or new.status is distinct from old.status then
    raise exception 'Only an administrator can change this field.' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_admin_columns on public.profiles;
create trigger profiles_guard_admin_columns
  before update on public.profiles
  for each row execute function public.profiles_guard_admin_columns();

-- ---------------------------------------------------------------------------
-- 6. wholesale_offers(product_ids) — wholesale prices for the signed-in
-- customer, if and only if they are approved and active. Anyone else gets an
-- empty result, not an error, so callers need no special case.
-- ---------------------------------------------------------------------------
create or replace function public.wholesale_offers(product_ids uuid[])
returns table (product_id uuid, wholesale_price numeric, wholesale_min_qty integer)
language sql
stable
security definer
set search_path = ''
as $$
  select t.product_id, t.wholesale_price, t.wholesale_min_qty
    from public.product_trade_prices t
    join public.products p on p.id = t.product_id and p.status = 'Published'
   where t.product_id = any (product_ids)
     and t.wholesale_price is not null
     and exists (
       select 1 from public.profiles pr
        where pr.id = auth.uid() and pr.is_wholesale_approved and pr.status = 'Active'
     );
$$;

revoke execute on function public.wholesale_offers(uuid[]) from public, anon;
grant execute on function public.wholesale_offers(uuid[]) to authenticated;

-- Internal trigger helpers are not an API.
revoke execute on function public.categories_enforce_depth()        from public, anon, authenticated;
revoke execute on function public.products_derive_stock()           from public, anon, authenticated;
revoke execute on function public.product_variants_touch_product()  from public, anon, authenticated;
revoke execute on function public.profiles_guard_admin_columns()    from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Storage — product and category images
--
-- Public bucket: images are served by URL to every visitor. Writes are
-- admin-only; the upload itself happens in a Server Action as the signed-in
-- admin, so these policies — not app code — are what stop anyone else.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

drop policy if exists "catalog: admin read"   on storage.objects;
drop policy if exists "catalog: admin insert" on storage.objects;
drop policy if exists "catalog: admin update" on storage.objects;
drop policy if exists "catalog: admin delete" on storage.objects;

create policy "catalog: admin read"
  on storage.objects for select to authenticated
  using (bucket_id = 'catalog' and public.is_admin());

create policy "catalog: admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'catalog' and public.is_admin());

create policy "catalog: admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'catalog' and public.is_admin())
  with check (bucket_id = 'catalog' and public.is_admin());

create policy "catalog: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'catalog' and public.is_admin());
