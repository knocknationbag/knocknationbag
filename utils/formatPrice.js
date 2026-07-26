const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }

/**
 * Format a price stored in major units.
 * Whole amounts drop the decimals to match the reference ("$249", not "$249.00").
 * Centralised so a future multi-currency/locale switch is a one-file change.
 */
export function formatPrice(amount, currency = 'USD') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return ''

  const symbol = SYMBOLS[currency] ?? ''
  const hasFraction = amount % 1 !== 0

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}
