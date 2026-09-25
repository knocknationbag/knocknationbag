/**
 * Order vocabulary, mirrored by check constraints in the orders table.
 * Client-safe (no server imports) so forms and badges can use it.
 */

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export const PAYMENT_STATUS_LABELS = {
  cod_pending: 'COD · to be collected',
  pending: 'Awaiting payment',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

export const PAYMENT_METHOD_LABELS = { cod: 'Cash on Delivery', online: 'Online payment' }

/** What each status means, in words a customer understands. */
export const ORDER_STATUS_HELP = {
  Pending: 'We have received your order.',
  Confirmed: 'Your order is confirmed and will be packed soon.',
  Processing: 'Your order is being packed.',
  Shipped: 'Your order is on its way.',
  Delivered: 'Your order has been delivered.',
  Cancelled: 'This order was cancelled.',
}

/** Badge tones for the storefront Badge component. */
export const ORDER_STATUS_TONE = {
  Pending: 'neutral',
  Confirmed: 'new',
  Processing: 'new',
  Shipped: 'new',
  Delivered: 'verified',
  Cancelled: 'neutral',
}
