#!/usr/bin/env node
/**
 * Checks that a deployed Razorpay webhook endpoint is live and holds the same
 * secret as .env.local — without printing the secret.
 *
 *   node scripts/verify-webhook.js                         (production)
 *   node scripts/verify-webhook.js https://example.com     (another origin)
 *
 * Sends one signed "knb.ping" event. The endpoint ignores unknown events, so
 * nothing is changed; only the HTTP status matters:
 *
 *   200  secret configured and matching        → ready
 *   400  secret configured but different       → copy .env.local's value into the host
 *   503  secret not configured on the server   → add RAZORPAY_WEBHOOK_SECRET and redeploy
 */

const crypto = require('node:crypto')
const { envReader } = require('./service-client')

const ORIGIN = (process.argv[2] || 'https://www.knocknation.co.in').replace(/\/$/, '')
const URL_ = `${ORIGIN}/api/webhooks/razorpay`

async function main() {
  const secret = envReader()('RAZORPAY_WEBHOOK_SECRET')
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not set in .env.local.')

  const body = JSON.stringify({ event: 'knb.ping', created_at: Math.floor(Date.now() / 1000), payload: {} })
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  const response = await fetch(URL_, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'content-type': 'application/json', 'x-razorpay-signature': signature },
    body,
  })

  const verdict = {
    200: 'READY — secret configured on the server and matches .env.local.',
    400: 'MISMATCH — the server has a different RAZORPAY_WEBHOOK_SECRET. Copy the value from .env.local and redeploy.',
    503: 'NOT CONFIGURED — the server has no RAZORPAY_WEBHOOK_SECRET. Add it in the host settings and redeploy.',
  }[response.status]

  console.log(`${URL_}\nHTTP ${response.status}  ${verdict ?? (response.status >= 300 && response.status < 400 ? `REDIRECT to ${response.headers.get('location')} — Razorpay does not follow redirects; use the final URL.` : 'Unexpected response.')}`)
  if (response.status !== 200) process.exitCode = 1
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
