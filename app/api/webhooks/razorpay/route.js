import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { verifyWebhookSignature } from '@/lib/payments/razorpay'

/**
 * Razorpay webhook — the safety net for payments the browser never reported
 * (tab closed, network lost right after paying) and the only source of
 * "failed" and "refunded".
 *
 * Every request must carry a valid X-Razorpay-Signature (HMAC of the raw body
 * with RAZORPAY_WEBHOOK_SECRET); anything else is rejected before the body is
 * trusted. Recording is idempotent, so Razorpay's retries and the browser
 * verification can overlap safely.
 *
 * Configure in Razorpay Dashboard → Webhooks: URL <site>/api/webhooks/razorpay,
 * events payment.captured, order.paid, payment.failed, refund.processed.
 */

async function findOrder(admin, column, value) {
  if (!value) return null
  const { data } = await admin.from('orders').select('id, order_number, total, razorpay_payment_id').eq(column, value).maybeSingle()
  return data
}

export async function POST(request) {
  const raw = await request.text()
  if (!verifyWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  let event
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const admin = createAdminClient()
  const payment = event?.payload?.payment?.entity

  try {
    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        const order = await findOrder(admin, 'razorpay_order_id', payment?.order_id)
        if (!order || payment?.status !== 'captured' || payment?.currency !== 'INR') break
        const { error } = await admin.rpc('mark_order_paid', { p_order_id: order.id, p_payment_id: payment.id, p_amount_paise: Number(payment.amount) })
        if (error) console.error('Webhook could not mark paid:', order.order_number, error.message)
        revalidateTag(CATALOG_TAG, { expire: 0 })
        break
      }
      case 'payment.failed': {
        const order = await findOrder(admin, 'razorpay_order_id', payment?.order_id)
        if (order) await admin.rpc('mark_order_payment_failed', { p_order_id: order.id })
        break
      }
      case 'refund.processed': {
        const refund = event?.payload?.refund?.entity
        const order = await findOrder(admin, 'razorpay_payment_id', refund?.payment_id)
        // A full refund marks the order refunded; partial refunds leave it paid.
        if (order && Number(refund.amount) >= Math.round(Number(order.total) * 100)) {
          await admin.rpc('mark_order_refunded', { p_order_id: order.id })
        }
        break
      }
      default:
        break
    }
  } catch (error) {
    // Let Razorpay retry on unexpected failures.
    console.error('Razorpay webhook error:', event?.event, error.message)
    return NextResponse.json({ error: 'processing failed' }, { status: 500 })
  }

  revalidatePath('/admin/orders')
  return NextResponse.json({ ok: true })
}
