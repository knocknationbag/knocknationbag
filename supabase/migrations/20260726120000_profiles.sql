-- ============================================================================
-- profiles
--
-- One row per Supabase auth user, holding the fields auth.users has no place
-- for (phone, avatar, status). auth.users itself is owned by Supabase and must
-- not be altered, so application data about a person lives here.
--
-- The primary key IS auth.users.id — a shared key rather than a separate
-- profile id, so a profile can never point at a user that does not exist and
-- the two can never drift.
-- ============================================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null default '',
  email       text        not null,
  phone       text,
  avatar_url  text,
  status      text        not null default 'Active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint profiles_status_check check (status in ('Active', 'Inactive')),
  constraint profiles_email_check  check (position('@' in email) > 1)
);

comment on table  public.profiles is 'Application-level user record, keyed to auth.users.';
comment on column public.profiles.status is 'Active | Inactive. Does not by itself revoke auth.';

-- Case-insensitive uniqueness: Supabase treats addresses case-insensitively,
-- so a plain unique index would still admit Ada@x.com alongside ada@x.com.
create unique index if not exists profiles_email_lower_key on public.profiles (lower(email));
create index        if not exists profiles_status_idx      on public.profiles (status);
create index        if not exists profiles_created_at_idx  on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Keep profiles in step with auth.users
--
-- security definer because the trigger runs as the signup transaction, which
-- has no rights on public.profiles. search_path is pinned: a security definer
-- function with a mutable search_path is a privilege-escalation vector.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who already exists (the bootstrap Super Admin).
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
from auth.users u
where u.email is not null
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The role lives in the JWT (app_metadata.role) rather than a table, so these
-- policies read the claim directly. When RBAC moves into the database, only
-- the is_admin() body below changes.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('super-admin', 'admin');
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own"      on public.profiles;
drop policy if exists "profiles: update own"    on public.profiles;
drop policy if exists "profiles: admin read"    on public.profiles;
drop policy if exists "profiles: admin write"   on public.profiles;

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

-- Deliberately no status column guard here beyond the check constraint: a user
-- editing their own row must not be able to flip themselves to another state
-- that grants anything. status grants nothing today.
create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles: admin read"
  on public.profiles for select to authenticated
  using (public.is_admin());

create policy "profiles: admin write"
  on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Table privileges
--
-- RLS filters the rows a role can already reach; it cannot grant reach. Without
-- these, every policy above is unreachable and PostgREST answers "permission
-- denied for table profiles".
--
-- Granted explicitly rather than left to ALTER DEFAULT PRIVILEGES: this project
-- creates new tables with only Dxtm (truncate, references, trigger, maintain)
-- for the API roles, so a table that relies on the default arrives unreadable.
--
-- anon gets nothing. There is no anonymous policy on this table, and a profile
-- is personal data — an unauthenticated caller has no business reading it.
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.profiles to authenticated;

-- service_role bypasses RLS, but bypassing RLS is not the same as holding the
-- privilege — it still needs the grant. This is the key server-side writes use.
grant all on public.profiles to service_role;
