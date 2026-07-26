import { NextResponse } from 'next/server'

import { updateSession, withSessionCookies } from '@/lib/supabase/middleware'
import { hasDashboardAccess } from '@/lib/auth/permissions'
import {
  ADMIN_HOME,
  ADMIN_LOGIN,
  ADMIN_UNAUTHORIZED,
  isAdminPath,
  isAlwaysOpenPath,
  isGuestOnlyPath,
  loginUrlFor,
  safeNextPath,
  NEXT_PARAM,
} from '@/lib/auth/routes'

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy` — the
 * behaviour is identical, but a file named `middleware.js` is now deprecated.
 * Supabase's docs still show `middleware.ts`; the equivalent here is this file.
 *
 * Two jobs:
 *   1. Refresh the Supabase session on every matched request (mandatory — see
 *      lib/supabase/middleware.js).
 *   2. Keep guests out of /admin and signed-in users off the login screen.
 *
 * Job 2 is an *optimistic* gate, exactly as the Next.js docs intend. It runs
 * before rendering and gives a fast, clean redirect, but it is not the security
 * boundary: the shell layout re-verifies the session with `getUser()` and every
 * Server Action must re-check authorisation itself (docs/CLAUDE.md §19).
 */
export async function proxy(request) {
  const { response, user, configured } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  if (!isAdminPath(pathname)) return response

  const redirectTo = (path) =>
    withSessionCookies(NextResponse.redirect(new URL(path, request.url)), response)

  // Supabase not wired up yet.
  //
  // In production that is a misconfiguration, and the safe reading of "no auth
  // available" is "no access" — anything else would serve the entire dashboard
  // to the public because an environment variable was missing. Locally it just
  // means the keys have not been pasted in yet, so the dashboard stays
  // browsable and the login screen explains what is missing.
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      return isGuestOnlyPath(pathname) ? response : redirectTo(ADMIN_LOGIN)
    }
    return response
  }

  // Already signed in? The login and forgot-password screens have nothing to
  // offer, so send the user where they were originally headed.
  if (isGuestOnlyPath(pathname)) {
    if (!user) return response
    return redirectTo(safeNextPath(request.nextUrl.searchParams.get(NEXT_PARAM)))
  }

  // Reset-password and unauthorized are reachable either way — see routes.js
  // for why gating them would break the flows they exist to serve.
  if (isAlwaysOpenPath(pathname)) return response

  if (!user) return redirectTo(loginUrlFor(pathname, search))

  // Authenticated but not entitled — a Customer account, or a staff account
  // whose role has not been assigned yet.
  if (!hasDashboardAccess(user)) return redirectTo(ADMIN_UNAUTHORIZED)

  // /admin is a bare entry point; the dashboard itself lives at /admin/dashboard.
  if (pathname === '/admin') return redirectTo(ADMIN_HOME)

  return response
}

export const config = {
  /**
   * Run on pages only. Static assets, the image optimiser and everything under
   * public/ are excluded — without a matcher, Proxy runs on every request and
   * would needlessly touch every CSS, JS and image file.
   */
  matcher: [
    '/((?!_next/static|_next/image|images/|icons/|logo/|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
  ],
}
