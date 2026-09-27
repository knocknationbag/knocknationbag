/**
 * Coupon vocabulary, mirrored by check constraints on public.coupons.
 * Client-safe (no server imports) so the cart form and the dashboard share it.
 */

export const COUPON_TYPES = {
  percentage: 'Percentage discount',
  flat: 'Flat amount discount',
  free_shipping: 'Free shipping',
}

/** Same rule as coupons_code_format. */
export const COUPON_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,31}$/

export function normaliseCouponCode(value) {
  return String(value ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * What coupon_quote()'s status means to the customer. `min_order` gets the
 * amount appended by the caller.
 */
export const COUPON_MESSAGES = {
  valid: 'Coupon applied.',
  invalid: 'This coupon code is not valid.',
  disabled: 'This coupon is not active right now.',
  expired: 'This coupon has expired.',
  empty: 'Add items to your cart to use a coupon.',
  min_order: 'Your order has not reached the minimum amount for this coupon.',
  usage_limit: 'This coupon has reached its usage limit.',
  customer_limit: 'You have already used this coupon the maximum number of times.',
}
