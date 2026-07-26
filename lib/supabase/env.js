/**
 * Single place where Supabase environment variables are read.
 *
 * Nothing else in the codebase touches `process.env` for Supabase, so there is
 * one answer to "is Supabase configured?" and one error message when it is not.
 *
 * Only the two NEXT_PUBLIC_* values may ever reach the browser bundle. The
 * service-role key is read exclusively in lib/supabase/admin.js, which is
 * marked `server-only`.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * True when the public credentials are present.
 *
 * Callers use this to degrade gracefully rather than crash: the site is fully
 * functional on static data today, so a missing key must not take it down.
 */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/**
 * Returns the public credentials or throws with an actionable message.
 * Call this only at the point a Supabase client is actually created.
 */
export function requireSupabaseEnv() {
  const missing = [
    !SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
    !SUPABASE_ANON_KEY && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean)

  if (missing.length) {
    throw new Error(
      `Supabase is not configured. Missing ${missing.join(' and ')}. ` +
        'Copy .env.local.example to .env.local and paste your project credentials. ' +
        'See docs/supabase.md.',
    )
  }

  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY }
}
