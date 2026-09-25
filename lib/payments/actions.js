'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { findCartId } from '@/lib/cart'
import { confirmPayment, paymentOptionsFor } from './index'
import { verifyCheckoutSignature } from './razorpay'

/**
 * Browser-facing payment actions. The browser may only say "start paying this
 * order" (by its unguessable access token) and "Razorpay says this payment
 * succeeded" — both are checked here; neither can mark anything paid by itself.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function orderByToken(accessToken) {
  if (!UUID.test(String(accessToken))) return null
  const { data } = await createAdminClient().from('orders').select('*').eq('access_token', accessToken).maybeSingle()
  return data
}

/** Razorpay Checkout options for "Pay now" on the order page. */
export async function startPayment(accessToken) {
  const order = await orderByToken(accessToken)
  if (!order) return { ok: false, error: 'Order not found.' }
  if (order.payment_status === 'paid') return { ok: false, error: 'This order is already paid.' }
  try {
    return { ok: true, payment: await paymentOptionsFor(order) }
  } catch (error) {
    const message = error.message === 'ONLINE_NOT_CONFIGURED'
      ? 'Online payment is not available right now.'
      : error.message === 'NOT_PAYABLE' ? 'This order can no longer be paid online.' : 'Could not start the payment. Please try again.'
    return { ok: false, error: message }
  }
}

/**
 * Called by Razorpay Checkout's success handler. Never trusts the browser:
 * the signature must match (key secret), and confirmPayment() re-reads the
 * payment from Razorpay before anything is recorded.
 */
export async function verifyPayment({ accessToken, razorpayOrderId, razorpayPaymentId, signature }) {
  const order = await orderByToken(accessToken)
  if (!order || !order.razorpay_order_id || order.razorpay_order_id !== razorpayOrderId) {
    return { ok: false, error: 'We could not match this payment to your order. If money was taken, contact us with your order number.' }
  }
  if (!verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    return { ok: false, error: 'The payment could not be verified. If money was taken, it will be refunded automatically or confirmed shortly.' }
  }

  try {
    await confirmPayment(order, razorpayPaymentId)
  } catch (error) {
    console.error('Payment confirmation failed:', order.order_number, error.message)
    return { ok: false, error: 'We could not confirm the payment yet. If money was taken, your order will update within a few minutes.' }
  }

  // Paid: empty the cart this order came from and refresh stock on the shop.
  const cartId = await findCartId(order.user_id ?? null)
  if (cartId) await createAdminClient().from('cart_items').delete().eq('cart_id', cartId)
  updateTag(CATALOG_TAG)
  revalidatePath('/admin/orders')
  return { ok: true, redirectTo: `/order/${order.access_token}` }
}
