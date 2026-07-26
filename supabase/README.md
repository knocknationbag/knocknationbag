# Database migrations

Two tables: `profiles` and `products`. Nothing else — no orders, inventory movements,
coupons, analytics, reviews, blog, CMS, roles or permissions.

**These have not been applied.** Until you run them, `/admin/users` and `/admin/products`
show a "Database not set up yet" panel instead of failing.

## Apply them

Run in filename order — `products` depends on `set_updated_at()` and `is_admin()` from `profiles`.

**Supabase dashboard** (simplest): SQL Editor → paste each file → Run.

**Supabase CLI:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## What they create

| | |
| --- | --- |
| `profiles` | One row per `auth.users` row. Name, email, phone, avatar, status, created date. |
| `products` | Catalogue, including every SEO column as a first-class field. |

Both have Row Level Security enabled.

### Things worth knowing before you run them

**The primary key of `profiles` is `auth.users.id`.** A profile cannot exist without an
account, and deleting the account deletes the profile. That is why creating a user in the
dashboard also creates a sign-in account.

**A trigger backfills profiles on signup**, and the migration backfills anyone who already
exists — so the bootstrap Super Admin gets a profile the moment you run it.

**Roles are still read from the JWT**, not from a table. `is_admin()` checks
`app_metadata.role`, so RLS and the dashboard agree on who is an admin without a roles
table existing. When RBAC moves into the database, `is_admin()` is the only thing that
changes.

**Slug format is enforced by a check constraint**, not just the application. A malformed
slug cannot arrive by any route — dashboard, import or `psql`.

**`sale_price` must be below `price`.** A "discount" that costs more is a data error, so
it is rejected at the database rather than caught by whoever notices first.

**`pg_trgm` is created for search.** If your project keeps extensions in the `extensions`
schema, change that line to `create extension if not exists pg_trgm with schema extensions;`.

## After applying

Reload `/admin/users` — the Super Admin account should already be listed, via the backfill.
