import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { isSupabaseConfigured, requireSupabaseEnv } from '@/lib/supabase/env'

/**
 * Coupons the admin chose to show on the website ("Show on website").
 *
 * Read through public_coupons(), which returns customer-safe fields only and
 * only for coupons that are public, active, unexpired and not used up — the
 * coupons table itself stays admin-only. Informational: applying a code still
 * goes through applyCoupon → coupon_quote() like any typed code.
 *
 * Not cached: it is read by per-visitor pages (cart, checkout) that render
 * per request anyway, so an expiry or a dashboard toggle shows immediately.
 * Never throws — no offers is a fine thing to show.
 */
export async function listPublicCoupons() {
  if (!isSupabaseConfigured()) return []
  const { url, anonKey } = requireSupabaseEnv()
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }) },
  })

  const { data, error } = await supabase.rpc('public_coupons', {}, { get: true })
  if (error) {
    // Before the migration is applied the function does not exist: show nothing.
    if (!/public_coupons|schema cache|does not exist/i.test(error.message)) console.error('Public coupons read failed:', error.message)
    return []
  }
  const now = Date.now()
  return (data ?? [])
    .filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > now)
    .map((row) => ({
      code: row.code,
      type: row.discount_type,
      value: Number(row.discount_value) || 0,
      minOrder: row.min_order_amount === null ? null : Number(row.min_order_amount),
      maxDiscount: row.max_discount_amount === null ? null : Number(row.max_discount_amount),
      expiresAt: row.expires_at,
    }))
}
