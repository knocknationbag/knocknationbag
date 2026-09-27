import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dbResult, friendlyDbError } from './errors'

/**
 * Return reads.
 *
 *   Admins       → session client; RLS "read" returns every return.
 *   Customers    → session client; RLS returns only returns on their orders,
 *                  and hides internal notes.
 *   Guest link   → service role by order id, only after the caller proved the
 *                  order's access token; internal notes filtered here.
 *
 * Returns are never written here — see the functions in the
 * returns_and_refunds migration.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const num = (value) => (value === null || value === undefined ? 0 : Number(value))

const ITEMS = 'items:return_items(id, quantity, order_item:order_items(id, product_name, variant_label, sku, image_url, unit_price, quantity, line_total))'
const ORDER = 'order:orders!return_requests_order_id_fkey(id, order_number, access_token, customer_name, email, phone, payment_method, payment_status, total, subtotal, discount, shipping_fee, razorpay_payment_id, delivered_at, shipping_address, user_id)'
const FULL = `*, ${ITEMS}, events:return_events(*), refunds(*), ${ORDER}`

function toRefund(row) {
  return {
    id: row.id,
    amount: num(row.amount),
    method: row.method,
    status: row.status,
    razorpayRefundId: row.razorpay_refund_id ?? '',
    reference: row.reference ?? '',
    failureReason: row.failure_reason ?? '',
    processedAt: row.processed_at,
    createdAt: row.created_at,
  }
}

export function toReturn(row, { internal = false } = {}) {
  const order = Array.isArray(row.order) ? row.order[0] : row.order
  return {
    id: row.id,
    number: row.return_number,
    orderId: row.order_id,
    status: row.status,
    reason: row.reason,
    details: row.details ?? '',
    customerMessage: row.customer_message ?? '',
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    receivedAt: row.received_at,
    inspectedAt: row.inspected_at,
    refundedAt: row.refunded_at,
    closedAt: row.closed_at,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      orderItemId: item.order_item?.id,
      name: item.order_item?.product_name ?? 'Item',
      variantLabel: item.order_item?.variant_label ?? '',
      sku: item.order_item?.sku ?? '',
      image: item.order_item?.image_url ?? null,
      unitPrice: num(item.order_item?.unit_price),
      orderedQuantity: item.order_item?.quantity ?? item.quantity,
      lineTotal: num(item.order_item?.line_total),
    })),
    events: (row.events ?? [])
      .filter((event) => internal || !event.is_internal)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((event) => ({ id: event.id, status: event.status, note: event.note ?? '', isInternal: event.is_internal, at: event.created_at })),
    refunds: (row.refunds ?? []).map(toRefund).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    order: order
      ? {
          id: order.id,
          number: order.order_number,
          accessToken: order.access_token,
          customerName: order.customer_name,
          email: order.email,
          phone: order.phone,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          total: num(order.total),
          subtotal: num(order.subtotal),
          discount: num(order.discount),
          shippingFee: num(order.shipping_fee),
          razorpayPaymentId: order.razorpay_payment_id ?? '',
          deliveredAt: order.delivered_at,
          shippingAddress: order.shipping_address,
          userId: order.user_id,
        }
      : null,
    createdAt: row.created_at,
  }
}

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

/** Returns on one of the signed-in customer's orders (RLS). */
export async function listMyReturnsForOrder(orderId) {
  if (!UUID.test(String(orderId))) return []
  const supabase = await createClient()
  const { data, error } = await supabase.from('return_requests').select(`*, ${ITEMS}, events:return_events(*), refunds(*)`)
    .eq('order_id', orderId).order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []).map((row) => toReturn(row))
}

/** Guest order page. Call only after the order's access token was verified. */
export async function listReturnsForVerifiedOrder(orderId) {
  if (!UUID.test(String(orderId))) return []
  const { data, error } = await createAdminClient().from('return_requests').select(`*, ${ITEMS}, events:return_events(*), refunds(*)`)
    .eq('order_id', orderId).order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []).map((row) => toReturn(row, { internal: false }))
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function listReturns({ query = '', status = '', page = 1, pageSize = 20 } = {}) {
  const supabase = await createClient()
  let request = supabase.from('return_requests')
    .select(`*, ${ITEMS}, ${ORDER}`, { count: 'exact' })

  const term = query.trim().replace(/[%,()]/g, ' ')
  if (term) request = request.ilike('return_number', `%${term}%`)
  if (status) request = request.eq('status', status)

  const from = (page - 1) * pageSize
  const { data, error, count } = await request.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  if (error) return dbResult({ error })
  return dbResult({ rows: (data ?? []).map((row) => toReturn(row, { internal: true })), total: count ?? 0 })
}

export async function getReturn(id) {
  if (!UUID.test(String(id))) return { ret: null, error: null }
  const supabase = await createClient()
  const { data, error } = await supabase.from('return_requests').select(FULL).eq('id', id).maybeSingle()
  if (error) return { ret: null, error: friendlyDbError(error) }
  return { ret: data ? toReturn(data, { internal: true }) : null, error: null }
}

/** Every return on an order, for the admin order page. */
export async function listReturnsForOrder(orderId) {
  if (!UUID.test(String(orderId))) return []
  const supabase = await createClient()
  const { data } = await supabase.from('return_requests').select(`*, ${ITEMS}, refunds(*)`).eq('order_id', orderId).order('created_at', { ascending: false })
  return (data ?? []).map((row) => toReturn(row, { internal: true }))
}

/** Open returns — the dashboard's "needs attention" count. */
export async function openReturnCount() {
  const supabase = await createClient()
  const { count } = await supabase.from('return_requests').select('id', { count: 'exact', head: true })
    .in('status', ['Requested', 'Under Review', 'Return Received', 'Inspection Passed', 'Refund Pending'])
  return count ?? 0
}
