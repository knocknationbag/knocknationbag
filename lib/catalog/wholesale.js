'use server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'

/**
 * Wholesale offers for the signed-in customer.
 *
 * Calls wholesale_offers() as the visitor. The database decides eligibility
 * (approved + active account) and returns nothing otherwise, so this cannot
 * leak a wholesale price to anyone else — even if a guest calls it directly.
 * Kept out of the page render so product pages stay static and cacheable.
 */
export async function getWholesaleOffers(productIds) {
  const ids = (Array.isArray(productIds) ? productIds : []).filter((id) => /^[0-9a-f-]{36}$/i.test(String(id))).slice(0, 100)
  if (!ids.length || !isSupabaseConfigured()) return {}

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('wholesale_offers', { product_ids: ids })
  if (error || !data) return {}

  return Object.fromEntries(
    data.map((row) => [row.product_id, { price: Number(row.wholesale_price), minQty: row.wholesale_min_qty }]),
  )
}
