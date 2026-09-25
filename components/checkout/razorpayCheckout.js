'use client'

import { verifyPayment } from '@/lib/payments/actions'

/**
 * Opens Razorpay Standard Checkout for options produced on the server
 * (lib/payments paymentOptionsFor), then hands the result to the server to
 * verify. Nothing here decides that a payment succeeded — verifyPayment does.
 *
 * Resolves with one of:
 *   { status: 'paid', redirectTo }   verified on the server
 *   { status: 'dismissed' }          customer closed the window
 *   { status: 'unverified', error }  Razorpay reported success but the server could not confirm yet
 *   { status: 'error', error }       the script could not load
 */

const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT}"]`)
    const script = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT, async: true })
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Razorpay could not load')))
    if (!existing) document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout(options, { onFailedAttempt } = {}) {
  try {
    await loadScript()
  } catch {
    return { status: 'error', error: 'The payment window could not load. Check your connection and try again.' }
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (result) => {
      if (!settled) {
        settled = true
        resolve(result)
      }
    }

    const checkout = new window.Razorpay({
      key: options.key,
      order_id: options.orderId,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#111827' },
      modal: { ondismiss: () => finish({ status: 'dismissed' }), confirm_close: true },
      handler: async (response) => {
        const result = await verifyPayment({
          accessToken: options.accessToken,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        })
        finish(result.ok ? { status: 'paid', redirectTo: result.redirectTo } : { status: 'unverified', error: result.error })
      },
    })

    // A failed attempt keeps the window open so the customer can retry with
    // another method; we only surface the message.
    checkout.on('payment.failed', (response) => onFailedAttempt?.(response?.error?.description ?? 'Payment failed.'))
    checkout.open()
  })
}
