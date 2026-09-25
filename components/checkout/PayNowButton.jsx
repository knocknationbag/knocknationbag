'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'

import Button from '@/components/ui/Button'
import AuthNotice from '@/components/auth/AuthNotice'
import { startPayment } from '@/lib/payments/actions'
import { openRazorpayCheckout } from './razorpayCheckout'
import { formatPrice } from '@/utils/formatPrice'

/**
 * "Pay now" for an unpaid online order (order page). Reuses the order's
 * Razorpay order, so retrying never creates a second charge.
 */
export default function PayNowButton({ accessToken, total }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  function pay() {
    setMessage(null)
    startTransition(async () => {
      const start = await startPayment(accessToken)
      if (!start.ok) return setMessage({ tone: 'error', text: start.error })
      const result = await openRazorpayCheckout(start.payment, {
        onFailedAttempt: (text) => setMessage({ tone: 'error', text: `${text} You can try again.` }),
      })
      if (result.status === 'paid') router.refresh()
      else if (result.status === 'dismissed') setMessage({ tone: 'info', text: 'Payment not completed. Your order is saved — pay whenever you are ready.' })
      else setMessage({ tone: 'error', text: result.error })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="primary" size="md" icon={CreditCard} onClick={pay} disabled={pending} className="self-start">
        {pending ? 'Opening payment…' : `Pay ${formatPrice(total)} now`}
      </Button>
      {message ? <AuthNotice tone={message.tone}>{message.text}</AuthNotice> : null}
    </div>
  )
}
