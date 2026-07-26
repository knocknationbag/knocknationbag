import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { SUPABASE_URL } from './env'

/**
 * Service-role Supabase client. **Bypasses Row Level Security entirely.**
 *
 * The `server-only` import above is the security boundary: if this module is
 * ever pulled into a Client Component, the build fails rather than shipping the
 * service-role key to the browser. Note the key deliberately has no
 * NEXT_PUBLIC_ prefix, so Next will not inline it into client bundles either.
 *
 * Use this only where elevated privileges are genuinely required and the caller
 * has already been authorised — webhooks, admin mutations, scheduled jobs.
 * Never use it to "make a query work" that RLS is blocking; fix the policy.
 *
 *   import { createAdminClient } from '@/lib/supabase/admin'
 *   const supabase = createAdminClient()
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !serviceRoleKey) {
    const missing = [
      !SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
      !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean)

    throw new Error(
      `Supabase admin client is not configured. Missing ${missing.join(' and ')}. ` +
        'See docs/supabase.md.',
    )
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      // A service-role client represents no user, so there is no session to
      // persist or refresh. Leaving these on would write stray auth state.
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
