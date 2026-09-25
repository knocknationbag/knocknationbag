import 'server-only'

import crypto from 'node:crypto'

/**
 * Razorpay, server side. Talks to the REST API directly (no SDK) with the key
 * secret from the environment — which never leaves the server. Only the key
 * id is ever sent to the browser, where Razorpay Checkout needs it.
 *
 *   RAZORPAY_KEY_ID          rzp_test_… / rzp_live_…   (public)
 *   RAZORPAY_KEY_SECRET      secret                     (server only)
 *   RAZORPAY_WEBHOOK_SECRET  secret set on the webhook  (server only)
 */

const API = 'https://api.razorpay.com/v1'

const env = (name) => (process.env[name] ?? '').trim()

export function razorpayKeyId() {
  return env('RAZORPAY_KEY_ID')
}

/** Online payment is offered only when both API keys are present. */
export function isOnlinePaymentConfigured() {
  return Boolean(env('RAZORPAY_KEY_ID') && env('RAZORPAY_KEY_SECRET'))
}

async function api(path, { method = 'GET', body } = {}) {
  const auth = Buffer.from(`${env('RAZORPAY_KEY_ID')}:${env('RAZORPAY_KEY_SECRET')}`).toString('base64')
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    // Razorpay's message is safe to log; it never contains the secret.
    console.error('Razorpay API error:', response.status, json?.error?.description ?? '')
    throw new Error('RAZORPAY_API_ERROR')
  }
  return json
}

/** Rupees → paise, exactly (₹707.88 → 70788). */
export const toPaise = (rupees) => Math.round(Number(rupees) * 100)

/** A Razorpay order for the order's exact, server-computed total. */
export async function createRazorpayOrder({ orderId, orderNumber, total }) {
  return api('/orders', {
    method: 'POST',
    body: {
      amount: toPaise(total),
      currency: 'INR',
      receipt: orderNumber,
      notes: { order_id: orderId, order_number: orderNumber },
    },
  })
}

export async function fetchPayment(paymentId) {
  return api(`/payments/${encodeURIComponent(paymentId)}`)
}

/** For accounts set to manual capture: capture exactly the authorised amount. */
export async function capturePayment(paymentId, amountPaise) {
  return api(`/payments/${encodeURIComponent(paymentId)}/capture`, { method: 'POST', body: { amount: amountPaise, currency: 'INR' } })
}

/** Constant-time comparison of two hex signatures. */
function safeEqual(expected, received) {
  const a = Buffer.from(String(expected), 'utf8')
  const b = Buffer.from(String(received ?? ''), 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * Checkout success signature: HMAC-SHA256("<order_id>|<payment_id>", key secret).
 * Proves the three ids came from Razorpay for this order — not from someone
 * posting a made-up "success" to our server.
 */
export function verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  const secret = env('RAZORPAY_KEY_SECRET')
  if (!secret || !razorpayOrderId || !razorpayPaymentId || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex')
  return safeEqual(expected, signature)
}

/** Webhook signature: HMAC-SHA256(raw request body, webhook secret). */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = env('RAZORPAY_WEBHOOK_SECRET')
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return safeEqual(expected, signature)
}
