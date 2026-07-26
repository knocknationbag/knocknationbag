/**
 * Permission helpers.
 *
 * Every check in the app goes through these functions. Nothing anywhere else
 * compares a role id to a string literal — `roleId === 'super-admin'` scattered
 * through components is exactly how permission systems rot. Roles and the
 * permissions they carry are declared once in constants/adminRoles.js; this
 * module is the only way to ask questions about them.
 *
 * Edge-safe: proxy.js imports it, so no `server-only` and no Node APIs.
 */

import { MODULE_PERMISSION, PERMISSIONS, getRole, roleCan } from '@/constants/adminRoles'

export { PERMISSIONS }

/** Every permission the user's role carries. Empty for signed-out or role-less users. */
export function permissionsOf(user) {
  return getRole(user?.roleId)?.permissions ?? []
}

/** The single permission predicate. `can(user, PERMISSIONS.CATALOG_EDIT)`. */
export function can(user, permission) {
  if (!user?.roleId || !permission) return false
  return roleCan(user.roleId, permission)
}

/** True when the user holds every listed permission. */
export function canAll(user, permissions = []) {
  return permissions.every((permission) => can(user, permission))
}

/** True when the user holds at least one of the listed permissions. */
export function canAny(user, permissions = []) {
  return permissions.some((permission) => can(user, permission))
}

/**
 * The permission a path requires, by longest-prefix match — so
 * `/admin/products/apex-duffle-pro/duplicate` inherits the Products rule
 * without every sub-route needing its own entry.
 */
export function requiredPermissionFor(pathname) {
  const match = Object.keys(MODULE_PERMISSION)
    .sort((a, b) => b.length - a.length)
    .find((href) => pathname === href || pathname.startsWith(`${href}/`))

  return match ? MODULE_PERMISSION[match] : null
}

/**
 * The gate for the dashboard as a whole.
 *
 * The Customer role carries no permissions at all, so a storefront account that
 * somehow reaches /admin is turned away here rather than by a special case.
 */
export function hasDashboardAccess(user) {
  return can(user, PERMISSIONS.DASHBOARD_VIEW)
}

/**
 * Whether the user may open a given admin path.
 *
 * Paths with no module rule (the auth screens, /admin itself) fall back to the
 * dashboard gate, so a new route is closed by default rather than open.
 */
export function canAccessPath(user, pathname) {
  const required = requiredPermissionFor(pathname)
  return required ? can(user, required) : hasDashboardAccess(user)
}
