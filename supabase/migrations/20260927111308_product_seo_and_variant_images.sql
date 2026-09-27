-- ============================================================================
-- product_seo_and_variant_images
--
--   1. products.breadcrumb_title   — short label for breadcrumbs (SEO tab)
--   2. product_variants.gallery    — extra images per colour; image_url stays
--                                    the variant's main image (cart + orders
--                                    already snapshot it)
--   3. product_slug_redirects      — a product whose slug changes keeps its
--                                    old URL working (301 to the new one)
--
-- Additive only: no existing column changes meaning, no data is rewritten.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Breadcrumb title
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists breadcrumb_title text;

alter table public.products drop constraint if exists products_breadcrumb_title_length;
alter table public.products add constraint products_breadcrumb_title_length
  check (breadcrumb_title is null or length(breadcrumb_title) <= 60);

comment on column public.products.breadcrumb_title is
  'Shorter product label for the breadcrumb trail and BreadcrumbList markup. Falls back to name.';

-- ---------------------------------------------------------------------------
-- 2. Variant galleries
-- ---------------------------------------------------------------------------
alter table public.product_variants
  add column if not exists gallery jsonb not null default '[]'::jsonb;

alter table public.product_variants drop constraint if exists product_variants_gallery_is_array;
alter table public.product_variants add constraint product_variants_gallery_is_array
  check (jsonb_typeof(gallery) = 'array');

comment on column public.product_variants.gallery is
  'Additional image URLs for this option, after image_url. Empty = the product gallery is shown.';

-- ---------------------------------------------------------------------------
-- 3. Slug history
--
-- Recorded by trigger rather than by the dashboard, so a slug changed by any
-- route (dashboard, import, psql) still leaves its old URL working.
-- ---------------------------------------------------------------------------
create table if not exists public.product_slug_redirects (
  old_slug   text primary key,
  product_id uuid        not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint product_slug_redirects_format check (old_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists product_slug_redirects_product_idx on public.product_slug_redirects (product_id);

create or replace function public.products_record_slug_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.slug is distinct from old.slug then
    insert into public.product_slug_redirects (old_slug, product_id)
    values (old.slug, new.id)
    on conflict (old_slug) do update set product_id = excluded.product_id, created_at = now();
  end if;
  -- A live slug always wins over a redirect of the same name.
  delete from public.product_slug_redirects where old_slug = new.slug;
  return null;
end;
$$;

drop trigger if exists products_record_slug_change on public.products;
create trigger products_record_slug_change
  after insert or update of slug on public.products
  for each row execute function public.products_record_slug_change();

revoke execute on function public.products_record_slug_change() from public, anon, authenticated;

alter table public.product_slug_redirects enable row level security;

drop policy if exists "product_slug_redirects: public read" on public.product_slug_redirects;
drop policy if exists "product_slug_redirects: admin write" on public.product_slug_redirects;

-- Only redirects to a published product are visible, so a draft's old slug
-- reveals nothing.
create policy "product_slug_redirects: public read"
  on public.product_slug_redirects for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'Published'));

create policy "product_slug_redirects: admin write"
  on public.product_slug_redirects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.product_slug_redirects to anon;
grant select, insert, update, delete on public.product_slug_redirects to authenticated;
grant all on public.product_slug_redirects to service_role;
