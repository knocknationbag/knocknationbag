import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { capturePayment, createRazorpayOrder, fetchPayment, isOnlinePaymentConfigured, razorpayKeyId, toPaise } from './razorpay'

/**
 * Online payment for an order, shared by checkout ("Place order") and the
 * order page ("Pay now"). All reads/writes use the service role; the order is
 * always identified server-side, never by an amount the browser sends.
 */

/** Only unpaid, uncancelled online orders can be paid. */
export function canPayOnline(order) {
  return order.payment_method === 'online' && ['pending', 'failed'].includes(order.payment_status) && order.status !== 'Cancelled'
}

/**
 * Options for Razorpay Checkout in the browser. Creates the Razorpay order the
 * first time and reuses it on retries (Razorpay allows several attempts per
 * order), so a customer who retries is never charged for a second order.
 */
export async function paymentOptionsFor(order) {
  if (!isOnlinePaymentConfigured()) throw new Error('ONLINE_NOT_CONFIGURED')
  if (!canPayOnline(order)) throw new Error('NOT_PAYABLE')

  let razorpayOrderId = order.razorpay_order_id
  if (!razorpayOrderId) {
    const created = await createRazorpayOrder({ orderId: order.id, orderNumber: order.order_number, total: order.total })
    razorpayOrderId = created.id
    const { error } = await createAdminClient().rpc('attach_razorpay_order', { p_order_id: order.id, p_razorpay_order_id: razorpayOrderId })
    if (error) throw new Error('ATTACH_FAILED')
  }

  return {
    key: razorpayKeyId(),
    orderId: razorpayOrderId,
    amount: toPaise(order.total),
    currency: 'INR',
    name: 'Knock Nation Bag',
    description: `Order ${order.order_number}`,
    prefill: { name: order.customer_name, email: order.email, contact: order.phone },
    accessToken: order.access_token,
  }
}

/**
 * Confirms a payment with Razorpay itself and records it.
 *
 * The signature proves the ids came from Razorpay; the API lookup proves the
 * money moved: right Razorpay order, captured, exact amount, INR. A payment
 * that is only "authorized" (manual-capture accounts) is captured here for the
 * exact amount. Recording is idempotent (mark_order_paid), so the webhook and
 * the browser can both confirm the same payment safely.
 *
 * Returns 'paid' | 'already_paid' | 'paid_stock_issue'; throws on any mismatch.
 */
export async function confirmPayment(order, razorpayPaymentId) {
  const admin = createAdminClient()
  let payment = await fetchPayment(razorpayPaymentId)

  if (payment.order_id !== order.razorpay_order_id) throw new Error('ORDER_MISMATCH')
  if (payment.currency !== 'INR' || Number(payment.amount) !== toPaise(order.total)) throw new Error('AMOUNT_MISMATCH')

  if (payment.status === 'authorized') payment = await capturePayment(razorpayPaymentId, payment.amount)
  if (payment.status !== 'captured') throw new Error('NOT_CAPTURED')

  const { data, error } = await admin.rpc('mark_order_paid', {
    p_order_id: order.id,
    p_payment_id: payment.id,
    p_amount_paise: Number(payment.amount),
  })
  if (error) throw new Error(error.message)
  return data
}
