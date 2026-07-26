import 'server-only'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { toAdminUser } from './user'
import { can, hasDashboardAccess } from './permissions'
import { ADMIN_UNAUTHORIZED, loginUrlFor } from './routes'

/**
 * Server-side session access for the dashboard.
 *
 * `server-only` is the boundary: importing any of this from a Client Component
 * fails the build rather than shipping session logic to the browser.
 */

/**
 * The signed-in user, or null.
 *
 * Always `getUser()`, never `getSession()`. `getSession()` only decodes the
 * cookie and trusts whatever it finds, so a forged cookie would read as a valid
 * session; `getUser()` revalidates the token against Supabase.
 */
export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) return null
  return toAdminUser(data.user)
}

/**
 * Stand-in identity used only when Supabase has no credentials *and* we are not
 * in production.
 *
 * Without it the dashboard would be unusable until keys are pasted in, which
 * would block UI work for no security benefit — the proxy blocks /admin
 * outright when configuration is missing in production.
 */
const PREVIEW_USER = {
  id: 'preview',
  email: 'preview@knocknationbag.com',
  name: 'Preview Mode',
  initials: 'PM',
  roleId: 'super-admin',
  roleLabel: 'Super Admin',
  lastSignInAt: null,
  isPreview: true,
}

/**
 * The user the dashboard shell should render for, falling back to preview mode
 * before configuration exists. Returns null when the request must be rejected.
 */
export async function getDashboardUser() {
  const user = await getSessionUser()
  if (user) return user

  if (!isSupabaseConfigured() && process.env.NODE_ENV !== 'production') {
    return PREVIEW_USER
  }
  return null
}

/** Requires a signed-in user with dashboard access, or redirects. */
export async function requireDashboardUser(pathname = '') {
  const user = await getDashboardUser()

  if (!user) redirect(loginUrlFor(pathname))
  if (!hasDashboardAccess(user)) redirect(ADMIN_UNAUTHORIZED)

  return user
}

/**
 * Requires a specific permission. Use this at the top of any Server Action or
 * route handler that mutates something — the proxy check does not cover them.
 *
 *   const user = await requirePermission(PERMISSIONS.CATALOG_EDIT)
 */
export async function requirePermission(permission, pathname = '') {
  const user = await requireDashboardUser(pathname)
  if (!can(user, permission)) redirect(ADMIN_UNAUTHORIZED)
  return user
}
