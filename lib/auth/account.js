import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { toAdminUser } from './user'
import { hasDashboardAccess } from './permissions'

/**
 * Who is visiting the storefront: 'guest', 'customer' or 'admin'.
 *
 * "Admin" means the same thing it means everywhere else — the role in
 * app_metadata grants dashboard access (permissions.js). A storefront sign-up
 * gets no role at all, so it is a customer and the dashboard stays closed to
 * it. Nothing here grants anything; it only describes the visitor to the UI.
 */
export const GUEST = { status: 'guest' }

export async function getAccount() {
  if (!isSupabaseConfigured()) return GUEST

  const supabase = await createClient()

  // getUser(), not getSession(): it revalidates the token with Supabase.
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return GUEST

  const user = toAdminUser(data.user)

  // The profile is the editable record (admins can rename a user), so it wins
  // over the metadata captured at sign-up. RLS lets a user read only their own
  // row. A missing row falls back to the auth user rather than failing.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const metadata = data.user.user_metadata ?? {}
  const name = profile?.full_name?.trim() || user.name

  return {
    status: hasDashboardAccess(user) ? 'admin' : 'customer',
    id: user.id,
    name,
    firstName: name.split(' ')[0],
    email: user.email,
    initials: initialsOf(name),
    avatarUrl: profile?.avatar_url || metadata.avatar_url || metadata.picture || null,
    roleLabel: user.roleId ? user.roleLabel : null,
    memberSince: profile?.created_at ?? data.user.created_at ?? null,
    providers: data.user.app_metadata?.providers ?? [],
  }
}

function initialsOf(name) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]
  return letters.toUpperCase()
}
