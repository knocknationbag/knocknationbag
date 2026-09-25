'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck } from 'lucide-react'

import { useAccount } from '@/components/auth/AccountProvider'
import { getWholesaleOffers } from '@/lib/catalog/wholesale'
import { formatPrice } from '@/utils/formatPrice'

/**
 * The wholesale price, shown only to approved wholesale customers.
 *
 * Fetched after load for signed-in visitors only; the database decides
 * eligibility and returns nothing for everyone else, so guests and retail
 * customers never receive the figure at all — it is not merely hidden.
 */
export default function WholesaleOffer({ productId }) {
  const { status } = useAccount()
  const [offer, setOffer] = useState(null)
  const signedIn = status === 'customer' || status === 'admin'

  useEffect(() => {
    if (!signedIn) return undefined
    let cancelled = false
    getWholesaleOffers([productId]).then((offers) => {
      if (!cancelled) setOffer(offers[productId] ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [signedIn, productId])

  if (!signedIn || !offer) return null

  return (
    <div className="mt-6 flex items-start gap-3 rounded-card border border-border bg-surface-muted p-4">
      <BadgeCheck size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
      <p className="text-[15px] leading-[24px] text-body">
        <strong className="font-semibold text-ink">Wholesale price: {formatPrice(offer.price)}</strong> per unit
        when you order {offer.minQty} or more. Applied automatically at checkout.
      </p>
    </div>
  )
}
