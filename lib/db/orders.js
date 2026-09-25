import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dbResult, friendlyDbError } from './errors'

/**
 * Order reads.
 *
 *   Customers    → session client; RLS returns only their own orders.
 *   Admins       → session client; RLS "admin read" returns every order.
 *   Guest link   → service role, by the unguessable access_token only.
 *
 * Orders are never written here — see create_order() / update_order_status().
 */

const num = (value) => (value === null || value === undefined ? 0 : Number(value))

function toItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.product_name,
    slug: row.product_slug,
    variantLabel: row.variant_label,
    sku: row.sku ?? '',
    image: row.image_url,
    unitPrice: num(row.unit_price),
    quantity: row.quantity,
    lineTotal: num(row.line_total),
    isWholesalePrice: row.is_wholesale_price,
  }
}

export function toOrder(row) {
  const items = (row.items ?? []).map(toItem)
  return {
    id: row.id,
    number: row.order_number,
    accessToken: row.access_token,
    userId: row.user_id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    awaitingOnlinePayment: row.payment_method === 'online' && ['pending', 'failed'].includes(row.payment_status) && row.status !== 'Cancelled',
    razorpayPaymentId: row.razorpay_payment_id ?? '',
    stockIssue: Boolean(row.stock_issue),
    isWholesale: row.is_wholesale,
    trackingNumber: row.tracking_number ?? '',
    courier: row.courier ?? '',
    note: row.customer_note ?? '',
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    // Same shape as lib/checkout/pricing computeTotals, so OrderSummary renders both.
    totals: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: num(row.subtotal),
      discount: num(row.discount),
      shippingFee: num(row.shipping_fee),
      gstRate: num(row.gst_rate),
      gstAmount: num(row.gst_amount),
      pricesIncludeGst: row.prices_include_gst,
      total: num(row.total),
      freeShippingRemaining: null,
    },
    total: num(row.total),
    paidAt: row.paid_at,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
  }
}

const FULL = '*, items:order_items(*)'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Guest (and customer) confirmation page. */
export async function getOrderByToken(token) {
  if (!UUID.test(String(token))) return null
  const { data } = await createAdminClient().from('orders').select(FULL).eq('access_token', token).maybeSingle()
  return data ? toOrder(data) : null
}

/** The signed-in customer's orders (RLS). */
export async function listMyOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select(FULL).order('created_at', { ascending: false }).limit(100)
  if (error) return []
  return (data ?? []).map(toOrder)
}

export async function getMyOrder(orderNumber) {
  const supabase = await createClient()
  const { data } = await supabase.from('orders').select(FULL).eq('order_number', String(orderNumber)).maybeSingle()
  return data ? toOrder(data) : null
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function listOrders({ query = '', status = '', payment = '', page = 1, pageSize = 20 } = {}) {
  const supabase = await createClient()
  let request = supabase.from('orders').select('*, items:order_items(quantity)', { count: 'exact' })

  const term = query.trim().replace(/[%,()]/g, ' ')
  if (term) request = request.or(`order_number.ilike.%${term}%,email.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`)
  if (status) request = request.eq('status', status)
  if (payment) request = request.eq('payment_status', payment)

  const from = (page - 1) * pageSize
  const { data, error, count } = await request.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  if (error) return dbResult({ error })
  return dbResult({ rows: (data ?? []).map(toOrder), total: count ?? 0 })
}

export async function getOrder(id) {
  if (!UUID.test(String(id))) return { order: null, error: null }
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select(FULL).eq('id', id).maybeSingle()
  if (error) return { order: null, error: friendlyDbError(error) }
  return { order: data ? toOrder(data) : null, error: null }
}

export async function orderStats() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('order_stats')
  if (error || !data) return null
  return {
    totalOrders: data.total_orders,
    todayOrders: data.today_orders,
    totalSales: Number(data.total_sales),
    todaySales: Number(data.today_sales),
    pendingOrders: data.pending_orders,
    toShip: data.to_ship,
    awaitingPayment: data.awaiting_payment ?? 0,
  }
}
