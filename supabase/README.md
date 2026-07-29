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

## Development data

```bash
node scripts/seed-dev-data.js
```

Writes 3 users and 30 products. Idempotent — users are matched by email and products by
slug, so re-running updates the same rows rather than adding more. It never deletes, and it
leaves the Super Admin account alone.

Re-running resets the seeded users' passwords, so the values it prints are always the ones
that work. They are development credentials for accounts on `example.com`, a domain that
cannot receive mail.

The dataset is `scripts/seed-fixtures.js`. Nothing in `app/` or `components/` imports it —
the dashboard reads these rows through `lib/db/*` like any other data.

Run it only after the migrations above. Without them it stops before writing anything and
tells you which table it could not reach.
