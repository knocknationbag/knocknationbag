import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from './env'
import { hardenCookieOptions } from './cookies'
import { toAdminUser } from '@/lib/auth/user'

/**
 * Refreshes the Supabase auth session on every matched request, and reports who
 * the request belongs to.
 *
 * Supabase's SSR guide requires this: access tokens are short-lived, and only an
 * edge/proxy layer can write refreshed cookies back to the browser. A Server
 * Component cannot set cookies, so without this the server would keep reading an
 * expired token and treat signed-in users as anonymous.
 *
 * Consumed by proxy.js at the project root. In Next.js 16 the `middleware` file
 * convention was renamed to `proxy`; this module keeps the Supabase-docs name so
 * the pattern stays recognisable, but the framework entry point is proxy.js.
 *
 * Returns `{ response, user, configured }`. Callers must keep using the returned
 * response object — building a fresh one drops the refreshed cookies and signs
 * the user out on the next request.
 */
export async function updateSession(request) {
  // The storefront runs entirely on static data until credentials are added.
  // Without this guard every request would throw the moment Proxy is registered.
  if (!isSupabaseConfigured()) {
    return { response: NextResponse.next({ request }), user: null, configured: false }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write to the request first so downstream handlers in this same pass
        // see the new cookies, then rebuild the response carrying them.
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, hardenCookieOptions(options))
        })
      },
    },
  })

  // getUser() revalidates the token with Supabase and triggers the cookie
  // refresh above. getSession() would only read the cookie without verifying
  // it, so it must not be used here.
  const { data, error } = await supabase.auth.getUser()

  return {
    response,
    user: error ? null : toAdminUser(data?.user),
    configured: true,
  }
}

/**
 * Copies the refreshed auth cookies onto a redirect response.
 *
 * A redirect built with `NextResponse.redirect()` starts empty, so without this
 * a request that both refreshes the session *and* redirects would throw the new
 * tokens away and sign the user out.
 */
export function withSessionCookies(redirectResponse, sessionResponse) {
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })
  return redirectResponse
}
