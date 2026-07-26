/**
 * Status vocabularies shared by forms, filters and the database.
 *
 * They live here rather than in lib/db/* because those modules are
 * `server-only` — importing a constant from one would drag the Supabase client
 * into the browser bundle and fail the build. The values are mirrored by check
 * constraints in supabase/migrations; change them in both places.
 */

export const USER_STATUSES = ['Active', 'Inactive']

export const PRODUCT_STATUSES = ['Draft', 'Published', 'Archived']

export const STOCK_STATUSES = ['In stock', 'Low stock', 'Out of stock', 'Backorder']
