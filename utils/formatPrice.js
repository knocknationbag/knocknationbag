const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }

/** The store's selling currency. One place, so a change is a one-line edit. */
export const STORE_CURRENCY = 'INR'

/**
 * Format a price stored in major units.
 * Whole amounts drop the decimals ("₹2,499", not "₹2,499.00"). Indian digit
 * grouping (₹1,24,999) for INR. Centralised so a currency change is one file.
 */
export function formatPrice(amount, currency = STORE_CURRENCY) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return ''

  const symbol = SYMBOLS[currency] ?? ''
  const hasFraction = amount % 1 !== 0

  return `${symbol}${amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}
