'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { requireDashboardUser } from '@/lib/auth/session'
import { fromProduct, fromTradePrices, fromVariant, uniqueSlug } from '@/lib/db/products'
import { friendlyDbError } from '@/lib/db/errors'
import { seoScore, validateSeo } from '@/lib/admin/seo'

/**
 * Product CRUD.
 *
 * The form posts one JSON payload rather than thirty form fields: the editor is
 * a controlled client component that already holds the whole product as an
 * object, and flattening it into inputs only to reassemble it here would add a
 * lossy step for nothing.
 *
 * Every action re-checks the session — the proxy does not cover POSTs
 * (docs/CLAUDE.md §19) — and RLS re-checks the admin role on every write.
 * Every change expires the storefront catalogue cache (updateTag), so the shop
 * shows it on the next request.
 */

const CONSTRAINTS = {
  products_slug_key: 'That slug is already in use by another product.',
  products_sku_key: 'That SKU is already in use by another product.',
  products_sale_below_price: 'The sale price must be lower than the regular price.',
  products_slug_format: 'The slug must be lowercase words separated by single hyphens.',
  products_price_check: 'Prices cannot be negative.',
  products_stock_check: 'Stock cannot be negative.',
  product_variants_value_key: 'Two variants have the same name.',
  product_variants_sku_key: 'A variant SKU is already in use.',
  product_variants_sale_below_price: 'A variant sale price must be lower than its price.',
  product_trade_prices_wholesale_pair: 'Set both a wholesale price and a minimum quantity, or neither.',
}

const fail = (error, fieldErrors = {}) => ({ ok: false, error, fieldErrors })
const isBlank = (value) => value === null || value === undefined || value === ''

function readPayload(formData) {
  try {
    return JSON.parse(String(formData.get('payload') ?? '{}'))
  } catch {
    return null
  }
}

function refreshCatalog(id) {
  updateTag(CATALOG_TAG)
  revalidatePath('/admin/products')
  revalidatePath('/admin/inventory')
  if (id) revalidatePath(`/admin/products/${id}`)
}

/** Server-side validation. The client mirrors this, but only this one counts. */
function validate(product) {
  const fieldErrors = {}
  if (!product.name?.trim()) fieldErrors.name = 'Enter a product name.'

  const price = Number(product.price)
  if (isBlank(product.price) || Number.isNaN(price) || price < 0) fieldErrors.price = 'Enter a valid price.'

  if (!isBlank(product.salePrice)) {
    const sale = Number(product.salePrice)
    if (Number.isNaN(sale) || sale < 0) fieldErrors.salePrice = 'Enter a valid sale price.'
    else if (sale >= price) fieldErrors.salePrice = 'The sale price must be lower than the regular price.'
  }

  if (!isBlank(product.costPrice) && (Number.isNaN(Number(product.costPrice)) || Number(product.costPrice) < 0)) {
    fieldErrors.costPrice = 'Enter a valid cost price.'
  }

  const hasWholesale = !isBlank(product.wholesalePrice)
  const hasMinQty = !isBlank(product.wholesaleMinQty)
  if (hasWholesale || hasMinQty) {
    const wholesale = Number(product.wholesalePrice)
    const minQty = Number(product.wholesaleMinQty)
    if (!hasWholesale || Number.isNaN(wholesale) || wholesale <= 0) {
      fieldErrors.wholesalePrice = 'Enter the wholesale price, or clear both wholesale fields.'
    } else if (wholesale >= Number(isBlank(product.salePrice) ? price : product.salePrice)) {
      fieldErrors.wholesalePrice = 'The wholesale price should be lower than the retail selling price.'
    }
    if (!hasMinQty || !Number.isInteger(minQty) || minQty < 2) {
      fieldErrors.wholesaleMinQty = 'Enter a minimum quantity of 2 or more.'
    }
  }

  if (product.hasVariants) {
    const variants = product.variants ?? []
    if (!variants.length) fieldErrors.variants = 'Add at least one variant, or switch variants off.'
    const names = variants.map((v) => String(v.value ?? '').trim().toLowerCase())
    if (names.some((name) => !name)) fieldErrors.variants = 'Every variant needs a name (e.g. Black).'
    else if (new Set(names).size !== names.length) fieldErrors.variants = 'Two variants have the same name.'
    for (const v of variants) {
      if (!Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) fieldErrors.variants = `Stock for "${v.value}" must be a whole number, 0 or more.`
      if (!isBlank(v.price) && (Number.isNaN(Number(v.price)) || Number(v.price) < 0)) fieldErrors.variants = `Price for "${v.value}" is not valid.`
      if (!isBlank(v.salePrice) && Number(v.salePrice) >= Number(isBlank(v.price) ? price : v.price)) {
        fieldErrors.variants = `Sale price for "${v.value}" must be lower than its price.`
      }
    }
  } else {
    const stock = Number(product.stock)
    if (!Number.isInteger(stock) || stock < 0) fieldErrors.stock = 'Enter a whole number, 0 or more.'
  }

  return fieldErrors
}

/** Score is derived, never posted — a client could otherwise claim 100. */
function scoreFor(product, slug) {
  return seoScore(validateSeo({ ...product.seo, slug, altText: product.seo?.altText ?? product.name }))
}

/** Makes the stored variants match the form: update, insert, delete. */
async function syncVariants(supabase, productId, product) {
  const { data: existing, error: readError } = await supabase.from('product_variants').select('id').eq('product_id', productId)
  if (readError) return readError

  const wanted = product.hasVariants ? product.variants ?? [] : []
  const keepIds = new Set(wanted.map((v) => v.id).filter(Boolean))
  const removeIds = (existing ?? []).map((row) => row.id).filter((id) => !keepIds.has(id))

  if (removeIds.length) {
    const { error } = await supabase.from('product_variants').delete().in('id', removeIds)
    if (error) return error
  }
  if (!wanted.length) return null

  const rows = wanted.map((v, index) => fromVariant(v, productId, product.optionName, index))
  const updates = rows.filter((row) => row.id)
  const inserts = rows.filter((row) => !row.id)

  if (updates.length) {
    const { error } = await supabase.from('product_variants').upsert(updates, { onConflict: 'id' })
    if (error) return error
  }
  if (inserts.length) {
    const { error } = await supabase.from('product_variants').insert(inserts)
    if (error) return error
  }
  return null
}

export async function saveProduct(_prevState, formData) {
  await requireDashboardUser()

  const product = readPayload(formData)
  if (!product) return fail('The form could not be read. Reload and try again.')

  const fieldErrors = validate(product)
  if (Object.keys(fieldErrors).length) return fail('Check the highlighted fields.', fieldErrors)

  let id = product.id || null
  const slug = await uniqueSlug(product.slug || product.name, id)
  const row = fromProduct({ ...product, slug }, scoreFor(product, slug))

  const supabase = await createClient()
  let created = false

  if (id) {
    const { error } = await supabase.from('products').update(row).eq('id', id)
    if (error) return fail(friendlyDbError(error, CONSTRAINTS))
  } else {
    const { data, error } = await supabase.from('products').insert(row).select('id').single()
    if (error) return fail(friendlyDbError(error, CONSTRAINTS))
    id = data.id
    created = true
  }

  // Product saved first so a new product has an id to hang these on. If either
  // step fails the message says so and a re-save completes it.
  const { error: tradeError } = await supabase
    .from('product_trade_prices')
    .upsert({ product_id: id, ...fromTradePrices(product) }, { onConflict: 'product_id' })
  const variantError = tradeError ? null : await syncVariants(supabase, id, product)
  const partial = tradeError ?? variantError

  refreshCatalog(id)

  if (partial) {
    return { ...fail(`Product saved, but ${tradeError ? 'pricing' : 'variants'} could not be: ${friendlyDbError(partial, CONSTRAINTS)}`), id, created }
  }
  return { ok: true, id, slug, created }
}

export async function deleteProduct(_prevState, formData) {
  await requireDashboardUser()

  const id = String(formData.get('id') ?? '')
  if (!id) return fail('Missing product id.')

  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))

  refreshCatalog()
  return { ok: true }
}

/** Used by the list's inline status control. */
export async function setProductStatus(_prevState, formData) {
  await requireDashboardUser()

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['Draft', 'Published', 'Archived'].includes(status)) return fail('Invalid request.')

  const supabase = await createClient()
  const { error } = await supabase.from('products').update({ status }).eq('id', id)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))

  refreshCatalog(id)
  return { ok: true }
}

/**
 * Inventory screen: set the stock of one product (no variants) or one variant.
 * The database recomputes the product total and its stock status.
 */
export async function updateStock(_prevState, formData) {
  await requireDashboardUser()

  const kind = String(formData.get('kind') ?? '')
  const id = String(formData.get('id') ?? '')
  const stock = Number(formData.get('stock'))
  if (!id || !['product', 'variant'].includes(kind)) return fail('Invalid request.')
  if (!Number.isInteger(stock) || stock < 0) return fail('Stock must be a whole number, 0 or more.')

  const supabase = await createClient()
  const table = kind === 'product' ? 'products' : 'product_variants'
  const { error } = await supabase.from(table).update({ stock }).eq('id', id)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))

  refreshCatalog()
  return { ok: true, id, stock }
}
