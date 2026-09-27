import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { isWebhookConfigured, verifyWebhookSignature } from '@/lib/payments/razorpay'

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
 * (refund.failed is handled too if it is ever subscribed.)
 */

async function findOrder(admin, column, value) {
  if (!value) return null
  const { data } = await admin.from('orders').select('id, order_number, total, razorpay_payment_id').eq(column, value).maybeSingle()
  return data
}

/**
 * The refunds row a Razorpay refund belongs to: by its Razorpay id, else by
 * the ids we put in its notes (lib/payments/refunds.js) — the latter covers a
 * refund whose API answer was lost before its id was stored.
 */
async function findReturnRefund(admin, refund) {
  if (!refund?.id) return null
  const byId = await admin.from('refunds').select('id').eq('razorpay_refund_id', refund.id).maybeSingle()
  if (byId.data) return byId.data.id
  const returnId = refund.notes?.knb_return_id
  if (!returnId) return null
  const live = await admin.from('refunds').select('id').eq('return_id', returnId).eq('status', 'pending').is('razorpay_refund_id', null).maybeSingle()
  if (live.data) return live.data.id
  const tagged = await admin.from('refunds').select('id, status').eq('id', refund.notes?.knb_refund_id ?? '00000000-0000-0000-0000-000000000000').maybeSingle()
  return tagged.data && tagged.data.status !== 'failed' ? tagged.data.id : null
}

export async function POST(request) {
  // A missing secret is a deployment mistake, not a bad request: answer 503 so
  // it shows up in Razorpay's webhook log instead of looking like forgery.
  if (!isWebhookConfigured()) {
    console.error('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set.')
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 })
  }

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
        // A refund started from a return: close it out (idempotent).
        const ours = await findReturnRefund(admin, refund)
        if (ours) {
          const { error } = await admin.rpc('record_refund_result', { p_refund_id: ours, p_status: 'processed', p_razorpay_refund_id: refund.id })
          if (error) throw new Error(error.message)
        }
        const order = await findOrder(admin, 'razorpay_payment_id', refund?.payment_id)
        // A full refund marks the order refunded; partial refunds leave it paid.
        if (order && Number(refund.amount) >= Math.round(Number(order.total) * 100)) {
          await admin.rpc('mark_order_refunded', { p_order_id: order.id })
        }
        break
      }
      case 'refund.failed': {
        const refund = event?.payload?.refund?.entity
        const ours = await findReturnRefund(admin, refund)
        if (ours) await admin.rpc('record_refund_result', { p_refund_id: ours, p_status: 'failed', p_razorpay_refund_id: refund.id, p_failure_reason: 'Razorpay reported the refund as failed.' })
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
