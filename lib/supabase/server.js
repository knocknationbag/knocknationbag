import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { requireSupabaseEnv } from './env'
import { hardenCookieOptions } from './cookies'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Uses the anon key and the caller's cookies, so Row Level Security applies as
 * the signed-in user. This is the default server-side client — reach for
 * lib/supabase/admin.js only when you deliberately need to bypass RLS.
 *
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 *
 * Async because `cookies()` returns a promise in Next 15+. Create a new client
 * per request — never hoist one to module scope, or one visitor's session
 * would leak into another's.
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, hardenCookieOptions(options))
          })
        } catch {
          // Server Components cannot set cookies. This is expected and safe to
          // ignore: proxy.js already refreshed the session for this request.
        }
      },
    },
  })
}
