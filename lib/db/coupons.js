import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { dbResult, friendlyDbError } from './errors'

/**
 * Coupon data access for the dashboard (admin RLS). Customers never read the
 * coupons table — the cart quotes a code through lib/coupons.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const num = (value) => (value === null || value === undefined ? null : Number(value))

/** Active | Disabled | Expired | Archived — what the list shows and filters on. */
export function couponState(row) {
  if (row.archived_at) return 'Archived'
  if (row.expires_at && new Date(row.expires_at) <= new Date()) return 'Expired'
  return row.is_active ? 'Active' : 'Disabled'
}

export function toCoupon(row, usage = null) {
  return {
    id: row.id,
    code: row.code,
    description: row.description ?? '',
    type: row.discount_type,
    value: num(row.discount_value) ?? 0,
    minOrderAmount: num(row.min_order_amount),
    maxDiscountAmount: num(row.max_discount_amount),
    expiresAt: row.expires_at,
    usageLimit: row.usage_limit,
    usageLimitPerCustomer: row.usage_limit_per_customer,
    isActive: row.is_active,
    archivedAt: row.archived_at,
    state: couponState(row),
    used: usage?.redeemed ?? 0,
    held: usage?.reserved ?? 0,
    createdAt: row.created_at,
  }
}

async function usageById(supabase) {
  const { data } = await supabase.rpc('coupon_usage_counts')
  return new Map((data ?? []).map((row) => [row.coupon_id, row]))
}

export async function listCoupons({ query = '', state = '', page = 1, pageSize = 20 } = {}) {
  const supabase = await createClient()
  let request = supabase.from('coupons').select('*', { count: 'exact' })

  const term = query.trim().replace(/[%,()]/g, ' ')
  if (term) request = request.or(`code.ilike.%${term}%,description.ilike.%${term}%`)
  const now = new Date().toISOString()
  if (state === 'Archived') request = request.not('archived_at', 'is', null)
  else request = request.is('archived_at', null)
  if (state === 'Active') request = request.eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`)
  if (state === 'Disabled') request = request.eq('is_active', false)
  if (state === 'Expired') request = request.lte('expires_at', now)

  const from = (page - 1) * pageSize
  const [{ data, error, count }, usage] = await Promise.all([
    request.order('created_at', { ascending: false }).range(from, from + pageSize - 1),
    usageById(supabase),
  ])
  if (error) return dbResult({ error })
  return dbResult({ rows: (data ?? []).map((row) => toCoupon(row, usage.get(row.id))), total: count ?? 0 })
}

export async function getCoupon(id) {
  if (!UUID.test(String(id))) return { coupon: null, error: null }
  const supabase = await createClient()
  const [{ data, error }, usage] = await Promise.all([
    supabase.from('coupons').select('*').eq('id', id).maybeSingle(),
    usageById(supabase),
  ])
  if (error) return { coupon: null, error: friendlyDbError(error) }
  return { coupon: data ? toCoupon(data, usage.get(data.id)) : null, error: null }
}
