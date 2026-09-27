'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { requireDashboardUser } from '@/lib/auth/session'
import { ORDER_STATUSES } from '@/constants/orders'

/**
 * Order status changes from the dashboard.
 *
 * All the rules live in update_order_status() in the database — admin check,
 * restock on cancel, COD marked paid on delivery, cancelled is final — so they
 * hold no matter how the call arrives. This action only validates the input
 * and refreshes the screens.
 */
export async function updateOrderStatus(_prevState, formData) {
  await requireDashboardUser()

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const trackingNumber = String(formData.get('trackingNumber') ?? '').trim().slice(0, 80)
  const courier = String(formData.get('courier') ?? '').trim().slice(0, 80)
  if (!id || !ORDER_STATUSES.includes(status)) return { ok: false, error: 'Choose a valid status.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('update_order_status', {
    p_order_id: id,
    p_status: status,
    p_tracking_number: trackingNumber || null,
    p_courier: courier || null,
  })
  if (error) {
    const readable = /cannot be reopened|administrator|not found/i.test(error.message) ? error.message : 'Could not update the order. Please try again.'
    return { ok: false, error: readable }
  }

  // A cancellation returns stock, which the shop shows.
  if (status === 'Cancelled') updateTag(CATALOG_TAG)
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/inventory')
  return { ok: true }
}

/**
 * Remembers that the bill or label was printed, so the order page can offer
 * "Reprint" and show when it was last printed. record_order_print() checks
 * the admin role itself.
 */
export async function recordOrderPrint(orderId, kind) {
  await requireDashboardUser()
  if (!['invoice', 'label'].includes(kind)) return { ok: false }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('record_order_print', { p_order_id: String(orderId), p_kind: kind })
  if (error) return { ok: false }
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true, count: data }
}
