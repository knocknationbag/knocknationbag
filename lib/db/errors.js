/**
 * Database error translation.
 *
 * The migrations in supabase/migrations are written but not applied, so the
 * most likely failure by far is "the table isn't there yet". That must read as
 * a setup step, not a crash — a module that white-screens tells you nothing
 * about what to do next.
 */

/** 42P01 = undefined_table. PGRST205 = PostgREST cannot find it in its schema cache. */
export function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205'
}

/** 23505 = unique_violation. */
export function isUniqueViolation(error) {
  return error?.code === '23505'
}

/** 23514 = check_violation — a constraint from the migration rejected the row. */
export function isCheckViolation(error) {
  return error?.code === '23514'
}

export const SETUP_MESSAGE =
  'The database tables have not been created yet. Apply the migrations in supabase/migrations, then reload.'

/**
 * Maps a Postgres error onto something a person can act on.
 *
 * `constraintMessages` lets a caller name its own constraints — the raw
 * "products_sale_below_price" is accurate but not an error message.
 */
export function friendlyDbError(error, constraintMessages = {}) {
  if (!error) return null
  if (isMissingTable(error)) return SETUP_MESSAGE

  const named = constraintMessages[error.constraint] ?? constraintMessages[error.details]
  if (named) return named

  if (isUniqueViolation(error)) return 'That value is already taken.'
  if (isCheckViolation(error)) return 'One of the values is outside the allowed range.'
  if (error.code === '42501' || error.message?.includes('row-level security')) {
    return 'Your account is not permitted to make this change.'
  }
  return error.message || 'Something went wrong.'
}

/** Uniform shape so a caller never has to guess whether it got rows or a problem. */
export const dbResult = ({ rows = [], total = 0, error = null } = {}) => ({
  rows,
  total,
  error,
  setupRequired: isMissingTable(error),
})
