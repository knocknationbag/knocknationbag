/**
 * Admin auth routes and the rules the proxy applies to them.
 *
 * Deliberately free of `next/headers`, `server-only` and any Node API: proxy.js
 * runs on the Edge runtime and imports this module directly. Keep it pure.
 */

export const ADMIN_ROOT = '/admin'
export const ADMIN_HOME = '/admin/dashboard'
export const ADMIN_LOGIN = '/admin/login'
export const ADMIN_FORGOT_PASSWORD = '/admin/forgot-password'
export const ADMIN_RESET_PASSWORD = '/admin/reset-password'
export const ADMIN_UNAUTHORIZED = '/admin/unauthorized'

/** Query key used to remember where an interrupted request was heading. */
export const NEXT_PARAM = 'next'

/**
 * Signed-in users are bounced away from these — there is nothing to do on a
 * login form when you already hold a session.
 */
const GUEST_ONLY = [ADMIN_LOGIN, ADMIN_FORGOT_PASSWORD]

/**
 * Reachable with or without a session.
 *
 * `/admin/reset-password` has to stay open to signed-in users: following a
 * recovery link *signs you in*, so treating it as guest-only would bounce every
 * user straight out of the password reset they had just started.
 *
 * `/admin/unauthorized` must stay reachable by a signed-in user who has no
 * dashboard permission, or the redirect to it would loop.
 */
const ALWAYS_OPEN = [ADMIN_RESET_PASSWORD, ADMIN_UNAUTHORIZED]

const matches = (list, pathname) =>
  list.some((route) => pathname === route || pathname.startsWith(`${route}/`))

export const isAdminPath = (pathname) =>
  pathname === ADMIN_ROOT || pathname.startsWith(`${ADMIN_ROOT}/`)

export const isGuestOnlyPath = (pathname) => matches(GUEST_ONLY, pathname)

export const isAlwaysOpenPath = (pathname) => matches(ALWAYS_OPEN, pathname)

/** True for admin routes that require a signed-in user with dashboard access. */
export const isProtectedAdminPath = (pathname) =>
  isAdminPath(pathname) && !isGuestOnlyPath(pathname) && !isAlwaysOpenPath(pathname)

/**
 * Sanitises a `?next=` value before redirecting to it.
 *
 * Only same-origin admin paths may be resumed. Everything else is an open
 * redirect waiting to happen — an absolute `https://evil.com`, a
 * protocol-relative `//evil.com`, or `/\evil.com`, which browsers normalise to
 * `//evil.com`. Anything suspicious falls back to the dashboard.
 */
export function safeNextPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return ADMIN_HOME
  if (value.startsWith('//') || value.startsWith('/\\')) return ADMIN_HOME
  if (!isAdminPath(value) || isGuestOnlyPath(value)) return ADMIN_HOME
  // Bare /admin exists only to redirect onward, so resolve it here rather than
  // making every sign-in pay for an extra round trip.
  if (value === ADMIN_ROOT) return ADMIN_HOME
  return value
}

/** Builds the login URL, remembering where the visitor was trying to go. */
export function loginUrlFor(pathname, search = '') {
  const target = `${pathname}${search}`
  if (!pathname || pathname === ADMIN_HOME) return ADMIN_LOGIN
  return `${ADMIN_LOGIN}?${NEXT_PARAM}=${encodeURIComponent(target)}`
}
