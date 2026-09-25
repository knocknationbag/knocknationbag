import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { requireSupabaseEnv } from './env'

/** Cache tag for everything the storefront reads from the catalogue. */
export const CATALOG_TAG = 'catalog'

/**
 * Anonymous, cookie-free Supabase client for public catalogue reads.
 *
 * Why not lib/supabase/server.js: that client reads cookies, which makes every
 * page using it dynamic. Catalogue data is the same for every visitor (RLS
 * returns Published products and Active categories to anon), so it is fetched
 * without a session and cached in Next's data cache under CATALOG_TAG.
 * Dashboard saves call updateTag(CATALOG_TAG), so the storefront shows a
 * change on the next request. The 5-minute revalidate covers edits made
 * outside the dashboard (seed scripts, the Supabase table editor).
 *
 * Never use this for anything user-specific.
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseEnv()

  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init = {}) =>
        fetch(input, { ...init, next: { revalidate: 300, tags: [CATALOG_TAG] } }),
    },
  })
}
