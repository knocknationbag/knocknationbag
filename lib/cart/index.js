import 'server-only'

import { cookies } from 'next/headers'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { PLACEHOLDER_IMAGE } from '@/lib/catalog'
import { computeTotals, retailPrice, round2, toSettings } from '@/lib/checkout/pricing'

/**
 * The shopping cart, stored in the database.
 *
 * A cart is identified by a random id in an httpOnly cookie, so guests have
 * one without an account and it survives a closed tab. Carts are read and
 * written only here, with the service role, scoped to that id — the carts
 * tables are closed to every API role, so a cart cannot be read or enumerated
 * from the browser. A signed-in customer's cart is also linked to their
 * account, so it follows them to another device.
 *
 * Every read re-prices from the database: current price, sale, stock and (for
 * approved wholesale customers) wholesale price.
 */

export const CART_COOKIE = 'knb_cart'
const CART_COOKIE_DAYS = 90
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ITEM_COLUMNS = [
  'id', 'quantity', 'product_id', 'variant_id',
  'product:products(id, name, slug, sku, price, sale_price, stock, status, featured_image, trade:product_trade_prices(wholesale_price, wholesale_min_qty))',
  'variant:product_variants(id, option_name, value, sku, price, sale_price, stock, is_active, image_url)',
].join(', ')

export function cartCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CART_COOKIE_DAYS * 24 * 60 * 60,
  }
}

/** The signed-in user's id and wholesale eligibility, or nulls for a guest. */
export async function getShopper() {
  if (!isSupabaseConfigured()) return { userId: null, wholesale: false }
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const userId = data?.user?.id ?? null
  if (!userId) return { userId: null, wholesale: false }

  const { data: profile } = await createAdminClient()
    .from('profiles').select('is_wholesale_approved, status').eq('id', userId).maybeSingle()
  return { userId, wholesale: Boolean(profile?.is_wholesale_approved && profile.status === 'Active') }
}

/** The cart named by this browser's cookie, if it still exists. One query, no auth call. */
async function cookieCartId() {
  const cookieId = (await cookies()).get(CART_COOKIE)?.value
  if (!cookieId || !UUID.test(cookieId)) return null
  const { data } = await createAdminClient().from('carts').select('id').eq('id', cookieId).maybeSingle()
  return data?.id ?? null
}

async function accountCartId(userId) {
  if (!userId) return null
  const { data } = await createAdminClient()
    .from('carts').select('id').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle()
  return data?.id ?? null
}

/**
 * The current cart id without creating one: the cookie's cart, or — for a
 * signed-in customer on a new device — their most recent cart.
 *
 * Pass `userId` when already known; pass `undefined` to look the user up only
 * if the cookie has no cart (the common case needs no auth round trip).
 */
export async function findCartId(userId) {
  const fromCookie = await cookieCartId()
  if (fromCookie) return fromCookie
  const uid = userId === undefined ? (await getShopper()).userId : userId
  return accountCartId(uid)
}

/** Total units in a cart, for the header badge. */
export async function countItems(cartId) {
  if (!cartId) return 0
  const { data } = await createAdminClient().from('cart_items').select('quantity').eq('cart_id', cartId)
  return (data ?? []).reduce((sum, row) => sum + row.quantity, 0)
}

export async function getStoreSettings() {
  const { data } = await createAdminClient().from('store_settings').select('*').eq('id', 1).maybeSingle()
  return toSettings(data)
}

/** Raw cart rows → priced lines. */
function priceLines(rows, wholesale) {
  // Wholesale minimums count every variant of a product together (e.g. 6 black + 4 tan = 10).
  const qtyByProduct = {}
  for (const row of rows) qtyByProduct[row.product_id] = (qtyByProduct[row.product_id] ?? 0) + row.quantity

  return rows.map((row) => {
    const product = row.product
    const variant = row.variant
    const trade = Array.isArray(product?.trade) ? product.trade[0] : product?.trade
    const available = Boolean(product && product.status === 'Published' && (!row.variant_id || (variant && variant.is_active)))
    const stock = available ? (variant ? variant.stock : product.stock) : 0

    const retail = product ? retailPrice(product, variant) : { unit: 0, regular: 0, onSale: false }
    const wholesaleUnit = trade?.wholesale_price !== null && trade?.wholesale_price !== undefined ? Number(trade.wholesale_price) : null
    const useWholesale = Boolean(
      wholesale && wholesaleUnit !== null && wholesaleUnit < retail.unit &&
      qtyByProduct[row.product_id] >= (trade.wholesale_min_qty ?? Infinity),
    )
    const unitPrice = useWholesale ? wholesaleUnit : retail.unit

    return {
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      name: product?.name ?? 'Unavailable product',
      slug: product?.slug ?? null,
      sku: variant?.sku || product?.sku || '',
      variantLabel: variant ? `${variant.option_name}: ${variant.value}` : null,
      image: variant?.image_url || product?.featured_image || PLACEHOLDER_IMAGE,
      quantity: row.quantity,
      unitPrice,
      regularPrice: retail.regular,
      onSale: retail.onSale && !useWholesale,
      isWholesalePrice: useWholesale,
      wholesaleOffer: wholesale && wholesaleUnit !== null && !useWholesale && trade?.wholesale_min_qty
        ? { price: wholesaleUnit, minQty: trade.wholesale_min_qty, productQty: qtyByProduct[row.product_id] }
        : null,
      lineTotal: round2(unitPrice * row.quantity),
      stock,
      available,
      // Something the customer must fix before checkout.
      problem: !available ? 'This item is no longer available.' : stock <= 0 ? 'Out of stock.' : row.quantity > stock ? `Only ${stock} left — reduce the quantity.` : null,
    }
  })
}

/**
 * The priced cart for the current visitor. Read-only: never sets cookies, so
 * it is safe to call from a Server Component.
 */
export async function loadCart() {
  const empty = { id: null, lines: [], totals: null, settings: null, shopper: { userId: null, wholesale: false }, canCheckout: false }
  if (!isSupabaseConfigured()) return empty

  // Independent lookups in parallel: every Supabase round trip is felt.
  const [shopper, settings, fromCookie] = await Promise.all([getShopper(), getStoreSettings(), cookieCartId()])
  const cartId = fromCookie ?? (await accountCartId(shopper.userId))
  if (!cartId) return { ...empty, settings, shopper, totals: computeTotals([], settings) }

  const { data: rows } = await createAdminClient()
    .from('cart_items').select(ITEM_COLUMNS).eq('cart_id', cartId).order('created_at')

  const lines = priceLines(rows ?? [], shopper.wholesale)
  const payable = lines.filter((line) => !line.problem)
  return {
    id: cartId,
    lines,
    totals: computeTotals(payable, settings),
    settings,
    shopper,
    canCheckout: lines.length > 0 && lines.every((line) => !line.problem),
  }
}

/** Item count for the header badge — cheap, no pricing. */
export async function cartCount() {
  if (!isSupabaseConfigured()) return 0
  return countItems(await findCartId(undefined))
}
