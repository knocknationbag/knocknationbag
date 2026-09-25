# Database migrations

`supabase/migrations/` is the single source of truth for the database schema of project
`myyvolvdbilbslpyozte`. V1 tables: `profiles`, `categories`, `products`, `product_variants`,
`product_trade_prices`, `store_settings`, `carts`, `cart_items`, `addresses`, `orders` and
`order_items`, plus the `catalog` storage bucket.

| File | Creates |
| --- | --- |
| `20260726120000_profiles.sql` | `profiles`, `set_updated_at()`, `handle_new_user()` + `on_auth_user_created` trigger on `auth.users`, `is_admin()`, backfill, RLS, policies, grants |
| `20260726120100_products.sql` | `products`, `pg_trgm`, search indexes, RLS, policies, grants. Depends on `set_updated_at()` and `is_admin()` above |
| `20260923180611_customer_profiles_from_oauth.sql` | `handle_new_user()` now stores the Google name/photo; new `on_auth_user_metadata_updated` trigger fills a blank name/photo when Google is linked to an existing account; two helper functions. No table or policy changes |
| `20260925084854_catalog_foundation.sql` | `categories` (+14 starting categories, one level of subcategories), `product_variants`, `product_trade_prices` (cost + wholesale, admin-only), `products.category_id / is_featured / material / specifications`, derived stock + stock status, `profiles.is_wholesale_approved` guarded against self-edit, `wholesale_offers()`, the `catalog` storage bucket and its policies. Drops `products.category` (text) and `products.cost_price` (moved) |
| `20260925093737_orders_and_checkout.sql` | `store_settings` (shipping fee, free-shipping threshold, GST, COD), `carts`/`cart_items` (service-role only), `addresses`, `orders`/`order_items`, `create_order()` (atomic stock check + order + stock deduction), `update_order_status()` (admin; restock on cancel; COD paid on delivery), `order_stats()` |
| `20260925113125_razorpay_payments.sql` | `orders.razorpay_order_id / razorpay_payment_id / stock_issue`; `mark_order_paid()` (idempotent, exact-amount check, deducts stock at payment time), `mark_order_payment_failed()`, `mark_order_refunded()`, `attach_razorpay_order()` — all service-role only; `order_stats()` now ignores never-paid online orders |

## The rule

**Every schema change is a new migration file.** Never change tables, policies, functions or
grants from the Supabase dashboard, and never edit a migration that has been applied — the
database would no longer match the files, and nothing would say so.

```bash
npm run db:new -- add_product_weight   # creates supabase/migrations/<timestamp>_add_product_weight.sql
# write the SQL
npm run db:status                      # shows it as pending
npm run db:migrate                     # applies pending files, in order, and records each one
```

Migrations must never destroy data by accident: no `drop table`, `truncate` or column drops
without a deliberate, reviewed reason, and a data-preserving path (add → backfill → switch →
remove) for anything that reshapes existing rows.

## Commands

All four read `SUPABASE_DB_URL` — from the environment, or `.env.local` (Dashboard → Connect →
**Session pooler**; the direct `db.<ref>` host is IPv6-only). The app never reads it. The scripts
refuse to run if it belongs to a different project than `NEXT_PUBLIC_SUPABASE_URL`, and never
print it.

| Command | Does | Writes? |
| --- | --- | --- |
| `npm run db:new -- <name>` | Creates an empty, correctly timestamped migration file | Local file only |
| `npm run db:status` | Lists each migration as applied / pending / edited since applied | No |
| `npm run db:inspect` | Prints the live schema from the catalogue, plus history and row counts | No (read-only transaction) |
| `npm run db:migrate` | Applies pending migrations, each in one transaction with its history row | Yes |

`node scripts/apply-migrations.js --mark-applied <version> ...` records a migration as applied
**without running it** — only for SQL that is already live (applied by hand, or before history
was tracked). Confirm with `db:inspect` first.

## Migration history

History is kept in `supabase_migrations.schema_migrations` — the same table the Supabase CLI
uses, so `supabase migration list` and `supabase db push` agree with these scripts if the
project is ever linked with the CLI. `db:migrate` refuses to run against a database that has
tables but no history, so already-live migrations cannot be re-run by mistake.

## Things worth knowing about the schema

**The primary key of `profiles` is `auth.users.id`.** A profile cannot exist without an
account, and deleting the account deletes the profile. That is why creating a user in the
dashboard also creates a sign-in account.

**A trigger creates a profile on signup**, and the migration backfilled anyone who already
existed.

**Roles are still read from the JWT**, not from a table. `is_admin()` checks
`app_metadata.role`, so RLS and the dashboard agree on who is an admin without a roles
table existing. When RBAC moves into the database, `is_admin()` is the only thing that
changes.

**Grants are explicit.** This project creates new tables without SELECT for the API roles, so
every new table needs its own `grant` lines or PostgREST answers "permission denied".
`anon` can read Active categories, Published products and their active variants — never
`product_trade_prices` (cost and wholesale), which only admins can read.

**Slug format is enforced by a check constraint**, not just the application. A malformed
slug cannot arrive by any route — dashboard, import or `psql`.

**`sale_price` must be below `price`.** A "discount" that costs more is a data error, so
it is rejected at the database rather than caught by whoever notices first.

**`pg_trgm` lives in the `public` schema.** Supabase's advisor recommends the `extensions`
schema; moving it would be a new migration, not an edit to the products one.

## Development data

```bash
node scripts/seed-dev-data.js                  # users + products
node scripts/seed-dev-data.js --catalog-only   # products only
```

**Dummy data — replace before launch.** Writes 3 users and 30 products, linked to the
starting categories, priced in rupees, with colour variants on 2 and wholesale offers on 5. Idempotent — users are matched by email and products by
slug, so re-running updates the same rows rather than adding more. It never deletes, and it
leaves the Super Admin account alone.

Re-running resets the seeded users' passwords, so the values it prints are always the ones
that work. They are development credentials for accounts on `example.com`, a domain that
cannot receive mail.

The dataset is `scripts/seed-fixtures.js`. Nothing in `app/` or `components/` imports it —
the dashboard reads these rows through `lib/db/*` like any other data.
