import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { dbResult, friendlyDbError } from './errors'

/**
 * User (profile) data access.
 *
 * A profile is keyed to auth.users.id, so "users" in the dashboard and accounts
 * that can sign in are the same set of people — see supabase/migrations.
 */

export function toUser(row) {
  return {
    id: row.id,
    name: row.full_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    avatarUrl: row.avatar_url ?? '',
    status: row.status ?? 'Active',
    isWholesaleApproved: Boolean(row.is_wholesale_approved),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function fromUser(user) {
  return {
    full_name: user.name?.trim() ?? '',
    email: user.email?.trim().toLowerCase() ?? '',
    phone: user.phone?.trim() || null,
    avatar_url: user.avatarUrl || null,
    status: user.status || 'Active',
    is_wholesale_approved: Boolean(user.isWholesaleApproved),
  }
}

export async function listUsers({ query = '', status = '', wholesale = '', page = 1, pageSize = 10 } = {}) {
  const supabase = await createClient()
  let request = supabase.from('profiles').select('*', { count: 'exact' })

  if (query.trim()) {
    const term = `%${query.trim()}%`
    request = request.or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
  }
  if (status) request = request.eq('status', status)
  if (wholesale === 'Approved') request = request.eq('is_wholesale_approved', true)
  if (wholesale === 'Not approved') request = request.eq('is_wholesale_approved', false)

  const from = (page - 1) * pageSize
  const { data, error, count } = await request
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) return dbResult({ error })
  return dbResult({ rows: (data ?? []).map(toUser), total: count ?? 0 })
}

/** Headline numbers for the dashboard home. */
export async function customerStats() {
  const supabase = await createClient()
  const [all, wholesale] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_wholesale_approved', true),
  ])
  return { total: all.error ? null : all.count ?? 0, wholesale: wholesale.error ? null : wholesale.count ?? 0 }
}

export async function getUser(id) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()

  if (error) return { user: null, error: friendlyDbError(error) }
  return { user: data ? toUser(data) : null, error: null }
}
