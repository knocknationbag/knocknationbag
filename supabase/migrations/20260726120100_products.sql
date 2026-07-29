-- ============================================================================
-- products
--
-- Depends on 20260726120000_profiles.sql for public.set_updated_at() and
-- public.is_admin(). Apply in filename order.
--
-- SEO columns are first-class rather than a jsonb blob: they are queried,
-- validated and reported on, and a blob would make "every product missing a
-- meta description" an application-side scan instead of an indexed query.
-- ============================================================================

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),

  -- Basic
  name              text        not null,
  slug              text        not null,
  sku               text,
  brand             text,
  category          text,
  short_description text,
  description       text,

  -- Pricing, in major units. numeric, never float: 0.1 + 0.2 must not drift.
  price             numeric(10, 2) not null default 0,
  sale_price        numeric(10, 2),
  cost_price        numeric(10, 2),

  -- Inventory
  stock             integer     not null default 0,
  stock_status      text        not null default 'In stock',
  low_stock_alert   integer     not null default 5,

  -- Images. Paths, not binaries — object storage is not wired up yet.
  featured_image    text,
  gallery           jsonb       not null default '[]'::jsonb,

  -- SEO
  seo_title         text,
  meta_description  text,
  meta_keywords     text,
  canonical_url     text,
  meta_robots       text        not null default 'index, follow',
  focus_keyword     text,
  og_title          text,
  og_description    text,
  og_image          text,
  twitter_title     text,
  twitter_description text,
  twitter_image     text,
  seo_score         integer     not null default 0,

  status            text        not null default 'Draft',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint products_status_check       check (status in ('Draft', 'Published', 'Archived')),
  constraint products_stock_status_check check (stock_status in ('In stock', 'Low stock', 'Out of stock', 'Backorder')),
  constraint products_price_check        check (price >= 0),
  constraint products_sale_price_check   check (sale_price is null or sale_price >= 0),
  constraint products_cost_price_check   check (cost_price is null or cost_price >= 0),
  -- A sale price at or above the price is not a sale; catching it here stops a
  -- storefront rendering a "discount" that costs more.
  constraint products_sale_below_price   check (sale_price is null or sale_price < price),
  constraint products_stock_check        check (stock >= 0),
  constraint products_low_stock_check    check (low_stock_alert >= 0),
  constraint products_seo_score_check    check (seo_score between 0 and 100),
  constraint products_gallery_is_array   check (jsonb_typeof(gallery) = 'array'),
  -- Slugs are URLs. Enforcing the shape here means a bad one cannot arrive by
  -- any route — the dashboard, a future import, or psql.
  constraint products_slug_format        check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table  public.products is 'Catalogue. One row per sellable product.';
comment on column public.products.slug is 'URL segment. Unique, immutable in spirit — changing one needs a 301.';

-- Uniqueness. Slug is the public identifier, so it is unconditionally unique.
create unique index if not exists products_slug_key on public.products (slug);

-- SKU is optional, but must be unique when present — a partial index is the
-- only way to allow many NULLs while rejecting duplicates.
create unique index if not exists products_sku_key on public.products (upper(sku)) where sku is not null;

create index if not exists products_status_idx     on public.products (status);
create index if not exists products_category_idx   on public.products (category);
create index if not exists products_brand_idx      on public.products (brand);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- Backs the list search box. pg_trgm makes ILIKE '%term%' index-assisted
-- instead of a sequential scan once the catalogue grows.
create extension if not exists pg_trgm;
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists products_sku_trgm_idx  on public.products using gin (sku  gin_trgm_ops);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products: public read published" on public.products;
drop policy if exists "products: admin read"            on public.products;
drop policy if exists "products: admin write"           on public.products;

-- The storefront reads published rows anonymously. Drafts and archived rows
-- are invisible without a session, so an unfinished product cannot leak.
create policy "products: public read published"
  on public.products for select to anon, authenticated
  using (status = 'Published');

create policy "products: admin read"
  on public.products for select to authenticated
  using (public.is_admin());

create policy "products: admin write"
  on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Table privileges
--
-- See the same section in the profiles migration for why these are explicit:
-- RLS filters rows, it does not grant access, and this project's default
-- privileges do not give the API roles SELECT.
--
-- anon gets SELECT and nothing else. That is what the storefront needs, and the
-- "public read published" policy above narrows it to Published rows — so an
-- anonymous reader can never see a draft.
-- ---------------------------------------------------------------------------
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
