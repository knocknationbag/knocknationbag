import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { createRefund, fetchRefund, listPaymentRefunds, toPaise } from './razorpay'

/**
 * Sends an opened refund (begin_refund) to Razorpay and records the answer.
 *
 * Duplicate protection, in layers:
 *   1. begin_refund() allows one live refund per return (unique index).
 *   2. Before creating, the payment's existing Razorpay refunds are checked
 *      for one tagged with this return — so if a previous attempt reached
 *      Razorpay but its answer was lost, it is adopted, not repeated.
 *   3. record_refund_result() is idempotent, so this answer and the
 *      refund.processed webhook can both arrive safely.
 *
 * Returns the Razorpay status: 'processed' | 'pending' | 'failed'.
 */
export async function executeRazorpayRefund(refund) {
  const admin = createAdminClient()
  const record = (status, razorpayRefundId = null, reason = null) =>
    admin.rpc('record_refund_result', {
      p_refund_id: refund.refundId,
      p_status: status,
      p_razorpay_refund_id: razorpayRefundId,
      p_failure_reason: reason,
    })

  let entity
  try {
    const existing = await listPaymentRefunds(refund.paymentId)
    entity = existing.find((r) => r.notes?.knb_return_id === refund.returnId && r.status !== 'failed')
    if (!entity) {
      entity = await createRefund(refund.paymentId, {
        amountPaise: toPaise(refund.amount),
        receipt: `${refund.returnNumber}-${refund.refundId.slice(0, 8)}`,
        notes: {
          knb_refund_id: refund.refundId,
          knb_return_id: refund.returnId,
          return_number: refund.returnNumber,
          order_number: refund.orderNumber,
        },
      })
    }
  } catch {
    await record('failed', null, 'Razorpay did not accept the refund request. Check the Razorpay dashboard, then try again.')
    return 'failed'
  }

  const status = ['processed', 'pending', 'failed'].includes(entity.status) ? entity.status : 'pending'
  const { error } = await record(status, entity.id, status === 'failed' ? 'Razorpay reported the refund as failed.' : null)
  if (error) console.error('Refund result not recorded:', refund.returnNumber, error.message)
  return status
}

/** "Check status" for a refund still pending at Razorpay (a missed webhook). */
export async function syncRazorpayRefund(refundId, razorpayRefundId) {
  const entity = await fetchRefund(razorpayRefundId)
  const status = ['processed', 'pending', 'failed'].includes(entity.status) ? entity.status : 'pending'
  const { error } = await createAdminClient().rpc('record_refund_result', {
    p_refund_id: refundId,
    p_status: status,
    p_razorpay_refund_id: razorpayRefundId,
    p_failure_reason: status === 'failed' ? 'Razorpay reported the refund as failed.' : null,
  })
  if (error) throw new Error(error.message)
  return status
}
