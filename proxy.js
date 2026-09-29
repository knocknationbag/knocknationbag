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
import {
  customerLoginUrlFor,
  isCustomerGuestOnlyPath,
  isCustomerProtectedPath,
  safeCustomerNextPath,
} from '@/lib/auth/customerRoutes'

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy` — the
 * behaviour is identical, but a file named `middleware.js` is now deprecated.
 * Supabase's docs still show `middleware.ts`; the equivalent here is this file.
 *
 * Two jobs:
 *   1. Refresh the Supabase session on every matched request (mandatory — see
 *      lib/supabase/middleware.js).
 *   2. Keep guests out of /admin and /account, and signed-in users off the
 *      login screens (admin and storefront each have their own).
 *
 * Job 2 is an *optimistic* gate, exactly as the Next.js docs intend. It runs
 * before rendering and gives a fast, clean redirect, but it is not the security
 * boundary: the shell layout re-verifies the session with `getUser()` and every
 * Server Action must re-check authorisation itself (docs/CLAUDE.md §19).
 */
export async function proxy(request) {
  const { response, user, configured } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  const redirectTo = (path) =>
    withSessionCookies(NextResponse.redirect(new URL(path, request.url)), response)

  // Storefront accounts. Same optimistic-gate rules as below: /account
  // re-verifies the session itself, this only makes the redirect fast.
  if (!isAdminPath(pathname)) {
    if (!configured) return response
    if (isCustomerGuestOnlyPath(pathname) && user) {
      return redirectTo(safeCustomerNextPath(request.nextUrl.searchParams.get(NEXT_PARAM)))
    }
    if (isCustomerProtectedPath(pathname) && !user) {
      return redirectTo(customerLoginUrlFor(pathname, search))
    }
    return response
  }

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
   * Only the routes that read the session while rendering, or that the gates
   * above protect. Everything else — home, product, shop, category,
   * collections, search, content pages, APIs and assets — renders without a
   * session, so running Proxy there (and for every <Link> prefetch of those
   * pages) was a Vercel Function invocation with nothing to do.
   *
   * Why these, and why prefetches of them still run Proxy:
   *   - Server Components on these routes read the session (admin shell,
   *     account, cart, checkout, order pages, reset-password). A Server
   *     Component cannot write cookies, so the token must be refreshed here,
   *     before rendering — including for prefetches, or a prefetch could spend
   *     a refresh token without saving the new one.
   *   - /login, /register, /forgot-password and /admin/(auth) redirect a
   *     signed-in visitor away; a prefetch that skipped that would cache the
   *     wrong page for the click.
   *   - /auth/* are the sign-in callbacks and the header's /auth/session check,
   *     which keeps a signed-in visitor's session fresh on public pages.
   *
   * Server Actions posted from public pages (add to cart, cart count,
   * wholesale price, sign-out) refresh the session themselves: Actions can
   * write cookies (lib/supabase/server.js).
   *
   * `:path*` matches the bare path too (/admin, /account).
   */
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/:path*',
    '/cart',
    '/checkout',
    '/order/:path*',
  ],
}
