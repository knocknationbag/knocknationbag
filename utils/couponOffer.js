import { formatPrice } from './formatPrice'
import { formatIndiaDate } from './indiaDate'

/**
 * Customer wording for a public coupon (lib/coupons/public.js).
 * { headline: '10% off', details: ['Up to ₹200 off', 'On orders of ₹1,500 or more', 'Valid till 31 Dec 2026'] }
 */
export function describeOffer(offer) {
  const headline = offer.type === 'free_shipping'
    ? 'Free shipping'
    : offer.type === 'percentage'
      ? `${offer.value}% off`
      : `${formatPrice(offer.value)} off`

  const details = [
    offer.type === 'percentage' && offer.maxDiscount ? `Up to ${formatPrice(offer.maxDiscount)} off` : null,
    offer.minOrder ? `On orders of ${formatPrice(offer.minOrder)} or more` : null,
    offer.expiresAt ? `Valid till ${formatIndiaDate(offer.expiresAt)}` : null,
  ].filter(Boolean)

  return { headline, details }
}
