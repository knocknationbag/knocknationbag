/**
 * Maps a Supabase user onto the shape the dashboard renders.
 *
 * Edge-safe (proxy.js imports it), so no `server-only` and no Node APIs.
 */

import { getRole } from '@/constants/adminRoles'

/**
 * The JWT claim that carries the role.
 *
 * It is read from `app_metadata`, never `user_metadata`. That distinction is
 * the whole security model here: `user_metadata` is writable by the user via
 * `supabase.auth.updateUser()`, so a role stored there would let any account
 * promote itself to Super Admin with a single client-side call. `app_metadata`
 * can only be written with the service-role key.
 */
export const ROLE_CLAIM = 'role'

function initialsOf(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]
  return letters.toUpperCase()
}

/** Reads the role id out of app_metadata, tolerating both shapes Supabase users adopt. */
export function roleIdFromMetadata(appMetadata = {}) {
  const claim = appMetadata[ROLE_CLAIM]
  if (typeof claim === 'string') return claim
  if (Array.isArray(appMetadata.roles) && typeof appMetadata.roles[0] === 'string') {
    return appMetadata.roles[0]
  }
  return null
}

/**
 * Converts a Supabase user into the dashboard's user object.
 *
 * An unrecognised or absent role deliberately yields `roleId: null` rather than
 * a default — permissions are granted explicitly, never inherited by accident.
 */
export function toAdminUser(supabaseUser) {
  if (!supabaseUser) return null

  const roleId = roleIdFromMetadata(supabaseUser.app_metadata)
  const role = getRole(roleId)
  const email = supabaseUser.email ?? ''
  const name = supabaseUser.user_metadata?.full_name?.trim() || email.split('@')[0] || 'Account'

  return {
    id: supabaseUser.id,
    email,
    name,
    initials: initialsOf(name),
    roleId: role?.id ?? null,
    roleLabel: role?.label ?? 'No role assigned',
    lastSignInAt: supabaseUser.last_sign_in_at ?? null,
  }
}
