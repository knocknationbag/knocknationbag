'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, TicketPercent } from 'lucide-react'

import Button from '@/components/ui/Button'
import AuthNotice from '@/components/auth/AuthNotice'
import { applyCoupon } from '@/lib/cart/actions'
import { describeOffer } from '@/utils/couponOffer'
import { cn } from '@/utils/cn'

/**
 * Coupons the shop shows publicly, under the coupon field in the cart and
 * checkout summaries. Informational: "Apply" sends the code through the same
 * applyCoupon → coupon_quote() path as typing it, so every rule (minimum
 * order, limits, per-customer use) is still decided on the server, and a
 * code that does not fit this cart says why.
 */
export default function AvailableOffers({ offers = [], appliedCode = null, className }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busyCode, setBusyCode] = useState(null)
  const [message, setMessage] = useState(null)

  if (!offers.length) return null

  function apply(code) {
    setMessage(null)
    setBusyCode(code)
    startTransition(async () => {
      const result = await applyCoupon(code)
      setMessage(result.ok ? { tone: 'success', text: `${code} applied.` } : { tone: 'error', text: `${code}: ${result.error}` })
      setBusyCode(null)
      router.refresh()
    })
  }

  return (
    <section aria-labelledby="available-offers" className={className}>
      <h3 id="available-offers" className="flex items-center gap-2 text-[15px] font-bold text-ink">
        <TicketPercent size={18} className="text-gold" aria-hidden="true" /> Available offers
      </h3>

      <ul className="mt-3 flex flex-col gap-2.5">
        {offers.map((offer) => {
          const { headline, details } = describeOffer(offer)
          const applied = appliedCode === offer.code
          return (
            <li key={offer.code} className={cn('flex flex-wrap items-center justify-between gap-3 rounded-media border bg-surface p-3', applied ? 'border-ink' : 'border-border')}>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="rounded-badge border border-dashed border-border-hover px-2 py-0.5 font-mono text-[13px] font-semibold text-ink">{offer.code}</span>
                  <span className="text-[14px] font-bold text-ink">{headline}</span>
                </p>
                {details.length ? <p className="mt-1.5 text-[13px] leading-[19px] text-body">{details.join(' · ')}</p> : null}
              </div>
              {applied ? (
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-verified-fg">
                  <Check size={16} aria-hidden="true" /> Applied
                </span>
              ) : (
                <Button variant="secondary" size="sm" disabled={pending} onClick={() => apply(offer.code)} aria-label={`Apply coupon ${offer.code}`}>
                  {busyCode === offer.code ? 'Applying…' : 'Apply'}
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      {message ? <AuthNotice tone={message.tone} className="mt-3">{message.text}</AuthNotice> : null}
    </section>
  )
}
