/**
 * Storefront (customer) auth routes and the rules the proxy applies to them.
 *
 * The customer counterpart of routes.js, kept separate so the two audiences
 * can never borrow each other's redirects: a customer sign-in must not resume
 * an /admin path, and an admin flow must not land on /account.
 *
 * Edge-safe — proxy.js imports it. No `server-only`, no Node APIs.
 */

import { isAdminPath } from './routes'

export const CUSTOMER_LOGIN = '/login'
export const CUSTOMER_REGISTER = '/register'
export const CUSTOMER_FORGOT_PASSWORD = '/forgot-password'
export const CUSTOMER_RESET_PASSWORD = '/reset-password'
export const CUSTOMER_HOME = '/account'

/** Emailed links and OAuth return here; see app/auth/{confirm,callback}. */
export const AUTH_CALLBACK = '/auth/callback'
export const AUTH_CONFIRM = '/auth/confirm'

/** A signed-in visitor has nothing to do on these, so the proxy moves them on. */
const GUEST_ONLY = [CUSTOMER_LOGIN, CUSTOMER_REGISTER, CUSTOMER_FORGOT_PASSWORD]

/** Require a session. Anything under /account is personal. */
const SIGNED_IN_ONLY = [CUSTOMER_HOME]

const matches = (list, pathname) =>
  list.some((route) => pathname === route || pathname.startsWith(`${route}/`))

export const isCustomerGuestOnlyPath = (pathname) => matches(GUEST_ONLY, pathname)

export const isCustomerProtectedPath = (pathname) => matches(SIGNED_IN_ONLY, pathname)

/**
 * Sanitises a `?next=` value for the storefront.
 *
 * Same-origin paths only — absolute, protocol-relative (`//evil.com`) and
 * backslash (`/\evil.com`) forms are rejected, exactly as in routes.js. Admin
 * paths and the guest-only screens are rejected too: resuming /login after
 * signing in would loop, and /admin has its own sign-in.
 */
export function safeCustomerNextPath(value, fallback = CUSTOMER_HOME) {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (isAdminPath(value) || isCustomerGuestOnlyPath(value)) return fallback
  if (value.startsWith('/auth/')) return fallback
  return value
}

/** The sign-in URL, remembering where the visitor was heading. */
export function customerLoginUrlFor(pathname, search = '') {
  const target = pathname ? `${pathname}${search}` : CUSTOMER_HOME
  return `${CUSTOMER_LOGIN}?next=${encodeURIComponent(target)}`
}
