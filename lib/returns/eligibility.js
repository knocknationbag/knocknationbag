import { RETURN_WINDOW_DAYS } from '@/constants/returns'
import { round2 } from '@/lib/checkout/pricing'

/**
 * What the order page should offer. Display only — create_return_request()
 * in the database re-checks every rule when the request is sent, so a stale
 * page or an edited form cannot get past it.
 *
 * Returns { eligible, reason, deadline, items: [{ ...orderItem, returnable }] }.
 */
export function returnEligibility(order, returns = [], now = new Date()) {
  const taken = {}
  for (const ret of returns) {
    if (ret.status === 'Rejected') continue
    for (const item of ret.items) taken[item.orderItemId] = (taken[item.orderItemId] ?? 0) + item.quantity
  }
  const items = order.items.map((item) => ({ ...item, returnable: Math.max(0, item.quantity - (taken[item.id] ?? 0)) }))

  const delivered = order.status === 'Delivered' && order.deliveredAt
  const deadline = delivered ? new Date(new Date(order.deliveredAt).getTime() + RETURN_WINDOW_DAYS * 86400000) : null

  let reason = null
  if (!delivered) reason = 'NOT_DELIVERED'
  else if (now > deadline) reason = 'WINDOW_CLOSED'
  else if ((order.shippingAddress?.country ?? 'India') !== 'India') reason = 'NOT_DOMESTIC'
  else if (order.paymentStatus === 'refunded') reason = 'ALREADY_REFUNDED'
  else if (order.paymentStatus !== 'paid') reason = 'NOT_PAID'
  else if (!items.some((item) => item.returnable > 0)) reason = 'ALREADY_REQUESTED'

  return { eligible: !reason, reason, deadline, items }
}

/**
 * A starting figure for the refund: what the customer actually paid for the
 * returned items — their share of the order after the coupon, including GST
 * where it was added on top — excluding the original shipping fee. The admin
 * can change it; begin_refund() caps it at what the order has left.
 */
export function suggestedRefund(ret, alreadyRefunded = 0) {
  const order = ret.order
  if (!order) return 0
  const paidForItems = Math.max(0, order.total - order.shippingFee)
  const ratio = order.subtotal > 0 ? paidForItems / order.subtotal : 0
  const itemsValue = ret.items.reduce((sum, item) => sum + (item.lineTotal * item.quantity) / Math.max(item.orderedQuantity, 1), 0)
  return round2(Math.max(0, Math.min(itemsValue * ratio, order.total - alreadyRefunded)))
}
