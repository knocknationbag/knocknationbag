-- ============================================================================
-- coupon_public_display
--
--   1. coupons.is_public   — admin toggle: "Show on website"
--   2. public_coupons()    — the only way the storefront lists coupons
--
-- Informational only. Nothing here changes how a coupon is validated or
-- applied: coupon_quote() and create_order() are untouched, and the coupons
-- table stays admin-only under RLS. public_coupons() returns customer-safe
-- columns only (never the internal note, limits, usage counts or ids), and
-- only for coupons a customer could use right now: public, active, not
-- archived, not expired, and not used up.
-- ============================================================================

alter table public.coupons
  add column if not exists is_public boolean not null default false;

comment on column public.coupons.is_public is
  'Show on website. Listed to customers by public_coupons() only while also active, unexpired and not used up.';

create index if not exists coupons_public_idx on public.coupons (is_public) where is_public;

create or replace function public.public_coupons()
returns table (
  code                text,
  discount_type       text,
  discount_value      numeric,
  min_order_amount    numeric,
  max_discount_amount numeric,
  expires_at          timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.code, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount, c.expires_at
    from public.coupons c
   where c.is_public
     and c.is_active
     and c.archived_at is null
     and (c.expires_at is null or c.expires_at > now())
     -- Same counting rule as coupon_quote(): redeemed uses plus live holds.
     and (c.usage_limit is null or c.usage_limit > (
           select count(*) from public.coupon_redemptions r
            where r.coupon_id = c.id
              and (r.status = 'redeemed' or (r.status = 'reserved' and r.reserved_until > now()))
         ))
   order by c.created_at desc
   limit 20;
$$;

revoke execute on function public.public_coupons() from public;
grant execute on function public.public_coupons() to anon, authenticated, service_role;
