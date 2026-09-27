'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { executeRazorpayRefund, syncRazorpayRefund } from '@/lib/payments/refunds'
import { isOnlinePaymentConfigured } from '@/lib/payments/razorpay'
import { RETURN_STATUSES } from '@/constants/returns'

/**
 * Return and refund actions from the dashboard.
 *
 * The rules live in the database functions — admin check, the allowed status
 * moves, "refund only after a passed inspection", one live refund per return,
 * the amount cap — so they hold however the call arrives. These actions
 * re-check the permission, validate input and talk to Razorpay, which only
 * the server can do (the key secret never leaves it).
 */

const fail = (error) => ({ ok: false, error })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Database messages written for people pass through; anything else is generic. */
const readable = (error, fallback) =>
  /cannot|only|already|refund|return|enter|tell the customer|administrator|not found|left of/i.test(error?.message ?? '')
    ? error.message
    : fallback

function refresh(returnId, orderId) {
  revalidatePath('/admin/returns')
  if (returnId) revalidatePath(`/admin/returns/${returnId}`)
  if (orderId) revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
}

export async function updateReturnStatus(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!UUID.test(id) || !RETURN_STATUSES.includes(status)) return fail('Choose a valid status.')

  const supabase = await createClient()
  const { error } = await supabase.rpc('update_return_status', {
    p_return_id: id,
    p_status: status,
    p_customer_message: String(formData.get('customerMessage') ?? '').trim().slice(0, 1000) || null,
    p_internal_note: String(formData.get('internalNote') ?? '').trim().slice(0, 1000) || null,
  })
  if (error) return fail(readable(error, 'Could not update the return. Please try again.'))

  refresh(id, String(formData.get('orderId') ?? ''))
  return { ok: true, message: `Return moved to ${status}.` }
}

/**
 * Opens the refund (database) and, for an online order, sends it to Razorpay.
 * Never automatic: only this explicit admin action starts a refund.
 */
export async function startRefund(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const id = String(formData.get('id') ?? '')
  const amount = Math.round(Number(formData.get('amount')) * 100) / 100
  if (!UUID.test(id)) return fail('Return not found.')
  if (!Number.isFinite(amount) || amount <= 0) return fail('Enter a refund amount above zero.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('begin_refund', { p_return_id: id, p_amount: amount })
  const refund = Array.isArray(data) ? data[0] : data
  if (error || !refund) return fail(readable(error, 'Could not start the refund. Please try again.'))

  refresh(id, refund.order_id)

  if (refund.method === 'manual') {
    return { ok: true, message: 'Refund opened. Pay the customer (bank transfer or UPI), then record the payment reference below.' }
  }
  if (!isOnlinePaymentConfigured()) {
    return fail('Refund opened, but Razorpay is not configured on this server. Configure it, then use "Retry refund".')
  }

  const status = await executeRazorpayRefund({
    refundId: refund.refund_id,
    returnId: id,
    returnNumber: refund.return_number,
    orderNumber: refund.order_number,
    paymentId: refund.razorpay_payment_id,
    amount: Number(refund.amount),
  })
  refresh(id, refund.order_id)
  if (status === 'failed') return fail('Razorpay could not process the refund. The return stays at Refund Pending — check the Razorpay dashboard and retry.')
  return {
    ok: true,
    message: status === 'processed'
      ? 'Refund processed by Razorpay.'
      : 'Refund accepted by Razorpay and in progress. It is marked Refunded automatically when Razorpay confirms it.',
  }
}

/** COD: record a refund the team paid outside the site. */
export async function recordManualRefund(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const refundId = String(formData.get('refundId') ?? '')
  const reference = String(formData.get('reference') ?? '').trim().slice(0, 200)
  if (!UUID.test(refundId)) return fail('Refund not found.')

  const supabase = await createClient()
  const { error } = await supabase.rpc('record_manual_refund', { p_refund_id: refundId, p_reference: reference })
  if (error) return fail(readable(error, 'Could not record the refund. Please try again.'))

  refresh(String(formData.get('returnId') ?? ''), String(formData.get('orderId') ?? ''))
  return { ok: true, message: 'Refund recorded. The return is now Refunded.' }
}

/** Re-reads a pending Razorpay refund (in case the webhook was missed). */
export async function checkRefundStatus(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const refundId = String(formData.get('refundId') ?? '')
  const razorpayRefundId = String(formData.get('razorpayRefundId') ?? '')
  if (!UUID.test(refundId) || !/^rfnd_[A-Za-z0-9]+$/.test(razorpayRefundId)) return fail('Refund not found.')

  // The refund must be visible to this admin through RLS before the service
  // role records anything for it.
  const supabase = await createClient()
  const { data: row } = await supabase.from('refunds').select('id, return_id, order_id').eq('id', refundId).eq('razorpay_refund_id', razorpayRefundId).maybeSingle()
  if (!row) return fail('Refund not found.')

  try {
    const status = await syncRazorpayRefund(refundId, razorpayRefundId)
    refresh(row.return_id, row.order_id)
    return { ok: true, message: `Razorpay reports this refund as ${status}.` }
  } catch {
    return fail('Could not reach Razorpay. Please try again.')
  }
}
