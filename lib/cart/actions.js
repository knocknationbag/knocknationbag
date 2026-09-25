'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { CART_COOKIE, cartCookieOptions, cartCount, countItems, findCartId, getShopper } from './index'

/**
 * Cart mutations. Every input is re-checked against the database: the product
 * must be Published, a variant must belong to it (and is required when the
 * product has variants), and quantities are capped by live stock. Nothing the
 * browser sends about prices is used — the cart stores only ids + quantities.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_QTY = 99
const fail = (error) => ({ ok: false, error })

/** The visitor's cart id, creating the cart (and its cookie) on first add. */
async function ensureCart(userId) {
  const admin = createAdminClient()
  let cartId = await findCartId(userId ?? null)
  if (!cartId) {
    const { data, error } = await admin.from('carts').insert({ user_id: userId }).select('id').single()
    if (error) throw new Error('Could not create a cart.')
    cartId = data.id
  } else if (userId) {
    // A guest who signs in keeps their cart, now tied to the account.
    await admin.from('carts').update({ user_id: userId }).eq('id', cartId).is('user_id', null)
  }
  ;(await cookies()).set(CART_COOKIE, cartId, cartCookieOptions())
  return cartId
}

function refresh() {
  revalidatePath('/cart')
  revalidatePath('/checkout')
}

export async function addToCart({ productId, variantId = null, quantity = 1 }) {
  if (!isSupabaseConfigured()) return fail('The shop is not configured yet.')
  const qty = Number(quantity)
  if (!UUID.test(String(productId)) || (variantId && !UUID.test(String(variantId)))) return fail('That product could not be found.')
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return fail('Choose a quantity between 1 and 99.')

  const admin = createAdminClient()
  const [{ data: product }, { userId }] = await Promise.all([
    admin.from('products').select('id, name, status, stock, variants:product_variants(id, value, stock, is_active)').eq('id', productId).maybeSingle(),
    getShopper(),
  ])
  if (!product || product.status !== 'Published') return fail('That product is no longer available.')

  const variants = product.variants ?? []
  let stock = product.stock
  if (variants.length) {
    const variant = variants.find((v) => v.id === variantId && v.is_active)
    if (!variant) return fail('Please choose an option first.')
    stock = variant.stock
  } else if (variantId) {
    return fail('That option could not be found.')
  }
  if (stock <= 0) return fail('Sorry, this is out of stock.')

  const cartId = await ensureCart(userId)

  let lineQuery = admin.from('cart_items').select('id, quantity').eq('cart_id', cartId).eq('product_id', productId)
  lineQuery = variantId ? lineQuery.eq('variant_id', variantId) : lineQuery.is('variant_id', null)
  const { data: existing } = await lineQuery.maybeSingle()

  const wanted = (existing?.quantity ?? 0) + qty
  if (wanted > stock) {
    return fail(existing ? `You already have ${existing.quantity} in your cart — only ${stock} available.` : `Only ${stock} available.`)
  }
  if (wanted > MAX_QTY) return fail('That is more than we can take in one order line.')

  const { error } = existing
    ? await admin.from('cart_items').update({ quantity: wanted }).eq('id', existing.id)
    : await admin.from('cart_items').insert({ cart_id: cartId, product_id: productId, variant_id: variantId || null, quantity: qty })
  if (error) return fail('Could not add to your cart. Please try again.')

  const [, count] = await Promise.all([
    admin.from('carts').update({ updated_at: new Date().toISOString() }).eq('id', cartId),
    countItems(cartId),
  ])
  refresh()
  return { ok: true, count, name: product.name }
}

/** The line must belong to this visitor's cart — ids from the browser are not trusted. */
async function ownLine(itemId) {
  if (!UUID.test(String(itemId))) return null
  const cartId = await findCartId(undefined)
  if (!cartId) return null
  const { data } = await createAdminClient()
    .from('cart_items')
    .select('id, cart_id, product:products(stock), variant:product_variants(stock)')
    .eq('id', itemId).eq('cart_id', cartId).maybeSingle()
  return data
}

export async function setCartQuantity(itemId, quantity) {
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return fail('Choose a quantity between 1 and 99.')
  const line = await ownLine(itemId)
  if (!line) return fail('That item is no longer in your cart.')

  const stock = line.variant ? line.variant.stock : line.product?.stock ?? 0
  if (qty > stock) return fail(`Only ${stock} available.`)

  const { error } = await createAdminClient().from('cart_items').update({ quantity: qty }).eq('id', line.id)
  if (error) return fail('Could not update the quantity.')
  refresh()
  return { ok: true, count: await countItems(line.cart_id) }
}

export async function removeCartItem(itemId) {
  const line = await ownLine(itemId)
  if (!line) return { ok: true, count: await cartCount() }
  await createAdminClient().from('cart_items').delete().eq('id', line.id)
  refresh()
  return { ok: true, count: await countItems(line.cart_id) }
}

export async function getCartCount() {
  return cartCount()
}
