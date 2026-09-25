/**
 * Cart and order pricing — the single set of rules for what a customer pays.
 *
 * Pure functions (no I/O), used by the cart page and by placeOrder, so the
 * total a customer is shown is the total they are charged. Inputs always come
 * from the database, never from the browser.
 */

export const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
const num = (value) => (value === null || value === undefined ? null : Number(value))

/**
 * Retail unit price for a product or one of its variants.
 * A variant with no price of its own inherits the product's price and sale;
 * a variant with its own price only has a sale if it has its own sale price.
 */
export function retailPrice(product, variant = null) {
  const regular = num(variant?.price) ?? num(product.price) ?? 0
  const inheritsSale = !variant || (variant.price === null && variant.sale_price === null)
  const sale = inheritsSale ? num(product.sale_price) : num(variant.sale_price)
  const unit = sale !== null && sale < regular ? sale : regular
  return { unit, regular, onSale: unit < regular }
}

/**
 * Settings row → the pricing rules. Missing settings (misconfigured project)
 * fall back to "no shipping, no GST" rather than breaking checkout.
 */
export function toSettings(row) {
  return {
    shippingFee: num(row?.shipping_fee) ?? 0,
    freeShippingThreshold: num(row?.free_shipping_threshold),
    gstEnabled: Boolean(row?.gst_enabled),
    gstRate: num(row?.gst_rate) ?? 0,
    pricesIncludeGst: row?.prices_include_gst !== false,
    codEnabled: row?.cod_enabled !== false,
  }
}

/**
 * Order totals from priced lines.
 *
 *   GST inclusive: prices already contain GST; the GST amount is shown, not added.
 *   GST exclusive: GST is added on top of the item subtotal.
 *   Shipping: the flat fee, unless the subtotal reaches the free threshold.
 *   GST applies to items only (shipping is not taxed in V1).
 */
export function computeTotals(lines, settings) {
  const subtotal = round2(lines.reduce((sum, line) => sum + line.lineTotal, 0))
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  const qualifiesFree = settings.freeShippingThreshold !== null && subtotal >= settings.freeShippingThreshold
  const shippingFee = subtotal > 0 && !qualifiesFree ? round2(settings.shippingFee) : 0

  const rate = settings.gstEnabled ? settings.gstRate : 0
  const gstAmount = rate
    ? round2(settings.pricesIncludeGst ? (subtotal * rate) / (100 + rate) : (subtotal * rate) / 100)
    : 0
  const total = round2(subtotal + shippingFee + (settings.pricesIncludeGst ? 0 : gstAmount))

  const freeShippingRemaining = settings.freeShippingThreshold !== null && shippingFee > 0
    ? round2(settings.freeShippingThreshold - subtotal)
    : null

  return {
    itemCount,
    subtotal,
    discount: 0,
    shippingFee,
    gstRate: rate,
    gstAmount,
    pricesIncludeGst: settings.pricesIncludeGst,
    total,
    freeShippingRemaining,
  }
}
