import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { COUPON_MESSAGES, normaliseCouponCode } from '@/constants/coupons'
import { formatPrice } from '@/utils/formatPrice'

/**
 * Coupon quotes for the cart and checkout.
 *
 * Eligibility and the discount are calculated by coupon_quote() in the
 * database — the same function create_order() re-runs under a row lock when
 * the order is placed — so the figure a customer is shown is the figure the
 * order is accepted at. The browser only ever sends a code.
 *
 * Returns { code, status, ok, message, discount, shippingDiscount }.
 */
export async function quoteCoupon({ code, userId = null, email = null, subtotal, shippingFee }) {
  const clean = normaliseCouponCode(code)
  if (!clean) return null

  const { data, error } = await createAdminClient().rpc('coupon_quote', {
    p_code: clean,
    p_user_id: userId,
    p_email: email || null,
    p_subtotal: subtotal,
    p_shipping_fee: shippingFee,
  })
  const row = Array.isArray(data) ? data[0] : data
  if (error || !row) {
    console.error('Coupon quote failed:', error?.message ?? 'no row')
    return { code: clean, status: 'error', ok: false, message: 'We could not check this coupon just now. Please try again.', discount: 0, shippingDiscount: 0 }
  }

  const discount = Number(row.discount) || 0
  const shippingDiscount = Number(row.shipping_discount) || 0
  const ok = row.status === 'valid'
  let message = COUPON_MESSAGES[row.status] ?? COUPON_MESSAGES.invalid
  if (row.status === 'min_order' && row.min_order_amount !== null) {
    message = `Add items worth ${formatPrice(Number(row.min_order_amount) - Number(subtotal))} more to use this coupon (minimum order ${formatPrice(Number(row.min_order_amount))}).`
  }
  // A valid code that saves nothing (free shipping on an order that already
  // ships free) is not applied, so it does not use up one of its uses.
  const noSaving = ok && discount <= 0 && shippingDiscount <= 0
  if (noSaving) message = row.discount_type === 'free_shipping' ? 'Shipping is already free on this order.' : 'This coupon does not reduce this order.'

  return {
    code: row.code ?? clean,
    status: row.status,
    ok: ok && !noSaving,
    type: row.discount_type,
    message,
    discount: ok ? discount : 0,
    shippingDiscount: ok ? shippingDiscount : 0,
  }
}
