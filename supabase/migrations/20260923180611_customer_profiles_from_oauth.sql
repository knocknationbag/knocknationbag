-- ============================================================================
-- customer_profiles_from_oauth
--
-- Storefront sign-up (email + password, and Google via Supabase OAuth) relies
-- on the existing on_auth_user_created trigger to create the profile row. Two
-- gaps made that incomplete for OAuth users:
--
--   1. handle_new_user() read only `full_name`. Google supplies `full_name`
--      and `name`, and the photo as `avatar_url` / `picture` — so the photo was
--      dropped and a Google user without `full_name` got their email prefix.
--   2. When Google is linked to an EXISTING account (Supabase links identities
--      with the same verified email automatically), no row is inserted into
--      auth.users, so nothing copied the new name or photo into the profile.
--
-- This replaces the function body and adds a fill-the-blanks trigger for (2).
-- No table, column, policy or grant changes; no existing row is rewritten
-- except to fill a missing avatar or empty name.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Name / avatar extraction, shared by both triggers so they cannot disagree.
-- Pure SQL, no table access — safe with an empty search_path.
-- ---------------------------------------------------------------------------
create or replace function public.profile_name_from_metadata(meta jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(btrim(coalesce(nullif(btrim(meta ->> 'full_name'), ''), meta ->> 'name', '')), '');
$$;

create or replace function public.profile_avatar_from_metadata(meta jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(btrim(coalesce(nullif(btrim(meta ->> 'avatar_url'), ''), meta ->> 'picture', '')), '');
$$;

-- These are helpers for the triggers, not an API. Supabase exposes every
-- function in `public` over PostgREST RPC unless EXECUTE is withheld.
revoke execute on function public.profile_name_from_metadata(jsonb)   from public, anon, authenticated;
revoke execute on function public.profile_avatar_from_metadata(jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- New user → profile
--
-- Same contract as before (one profile per auth user, never overwritten), now
-- with the OAuth name and photo. A user with no email (phone-only sign-up —
-- not offered today) is skipped rather than failing the whole sign-up on the
-- profiles.email NOT NULL / format constraints.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(public.profile_name_from_metadata(new.raw_user_meta_data), split_part(new.email, '@', 1)),
    public.profile_avatar_from_metadata(new.raw_user_meta_data)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Metadata update → fill blanks in the existing profile
--
-- Fires when Supabase refreshes user_metadata, which it does when a Google
-- identity signs in or is linked to an existing account. It only ever fills a
-- missing avatar or an empty name: a name the customer or an admin has set is
-- never replaced by whatever the provider sends.
-- ---------------------------------------------------------------------------
create or replace function public.handle_user_metadata_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_name   text := public.profile_name_from_metadata(new.raw_user_meta_data);
  meta_avatar text := public.profile_avatar_from_metadata(new.raw_user_meta_data);
begin
  if meta_name is null and meta_avatar is null then
    return new;
  end if;

  update public.profiles p
     set full_name  = case when p.full_name = '' and meta_name is not null then meta_name else p.full_name end,
         avatar_url = coalesce(p.avatar_url, meta_avatar)
   where p.id = new.id
     and ((p.full_name = '' and meta_name is not null) or (p.avatar_url is null and meta_avatar is not null));

  return new;
end;
$$;

drop trigger if exists on_auth_user_metadata_updated on auth.users;
create trigger on_auth_user_metadata_updated
  after update of raw_user_meta_data on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function public.handle_user_metadata_update();

-- Trigger functions cannot be called over RPC (they return `trigger`), but
-- withholding EXECUTE keeps them out of the API surface entirely.
revoke execute on function public.handle_new_user()             from public, anon, authenticated;
revoke execute on function public.handle_user_metadata_update() from public, anon, authenticated;
