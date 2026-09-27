'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TicketPercent, X } from 'lucide-react'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import AuthNotice from '@/components/auth/AuthNotice'
import { applyCoupon, removeCoupon } from '@/lib/cart/actions'
import { formatPrice } from '@/utils/formatPrice'

/**
 * Coupon code entry for the cart and checkout summaries.
 *
 * Sends only the code. Whether it applies — and by how much — is decided on
 * the server (coupon_quote in the database); the refreshed page then shows
 * the totals the server computed. `coupon` is the cart's current quote.
 */
export default function CouponForm({ coupon = null, className }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState(null)
  const [pending, startTransition] = useTransition()

  function run(action) {
    setMessage(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) setMessage({ tone: 'error', text: result.error })
      else if (result.message) setMessage({ tone: 'success', text: result.message })
      if (result.ok) setCode('')
      router.refresh()
    })
  }

  const saving = coupon ? coupon.discount + coupon.shippingDiscount : 0

  if (coupon) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between gap-3 rounded-media border border-border bg-surface px-4 py-3">
          <p className="flex min-w-0 items-center gap-2 text-[14px] text-body">
            <TicketPercent size={18} className="shrink-0 text-gold" aria-hidden="true" />
            <span className="min-w-0">
              <span className="font-mono font-semibold text-ink">{coupon.code}</span>
              {' · '}
              {coupon.ok ? `You save ${formatPrice(saving)}` : 'Not applied'}
            </span>
          </p>
          <button
            type="button"
            onClick={() => run(removeCoupon)}
            disabled={pending}
            aria-label={`Remove coupon ${coupon.code}`}
            className="grid size-11 shrink-0 place-items-center rounded-full text-body transition-colors hover:text-ink disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {coupon.ok ? null : <AuthNotice tone="error" className="mt-3">{coupon.message}</AuthNotice>}
        {message && coupon.ok ? <AuthNotice tone={message.tone} className="mt-3">{message.text}</AuthNotice> : null}
      </div>
    )
  }

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        run(() => applyCoupon(code))
      }}
      noValidate
    >
      <div className="flex items-end gap-3">
        <Field
          id="coupon-code"
          name="coupon"
          label="Coupon code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter code"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={32}
          className="flex-1"
        />
        <Button type="submit" variant="dark" size="md" disabled={pending || !code.trim()} className="h-12 px-6">
          {pending ? 'Checking…' : 'Apply'}
        </Button>
      </div>
      {message ? <AuthNotice tone={message.tone} className="mt-3">{message.text}</AuthNotice> : null}
    </form>
  )
}
