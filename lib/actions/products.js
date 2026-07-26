'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { requireDashboardUser } from '@/lib/auth/session'
import { fromProduct, uniqueSlug } from '@/lib/db/products'
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
 * (docs/CLAUDE.md §19).
 */

const CONSTRAINTS = {
  products_slug_key: 'That slug is already in use by another product.',
  products_sku_key: 'That SKU is already in use by another product.',
  products_sale_below_price: 'The sale price must be lower than the regular price.',
  products_slug_format: 'The slug must be lowercase words separated by single hyphens.',
  products_price_check: 'Prices cannot be negative.',
  products_stock_check: 'Stock cannot be negative.',
}

const fail = (error, fieldErrors = {}) => ({ ok: false, error, fieldErrors })

function readPayload(formData) {
  try {
    return JSON.parse(String(formData.get('payload') ?? '{}'))
  } catch {
    return null
  }
}

/** Server-side validation. The client mirrors this, but only this one counts. */
function validate(product) {
  const fieldErrors = {}
  if (!product.name?.trim()) fieldErrors.name = 'Enter a product name.'

  const price = Number(product.price)
  if (Number.isNaN(price) || price < 0) fieldErrors.price = 'Enter a valid price.'

  if (product.salePrice !== null && product.salePrice !== '' && product.salePrice !== undefined) {
    const sale = Number(product.salePrice)
    if (Number.isNaN(sale) || sale < 0) fieldErrors.salePrice = 'Enter a valid sale price.'
    else if (sale >= price) fieldErrors.salePrice = 'The sale price must be lower than the regular price.'
  }

  const stock = Number(product.stock)
  if (Number.isNaN(stock) || stock < 0) fieldErrors.stock = 'Enter a valid stock quantity.'

  return fieldErrors
}

/** Score is derived, never posted — a client could otherwise claim 100. */
function scoreFor(product, slug) {
  return seoScore(validateSeo({ ...product.seo, slug, altText: product.seo?.altText ?? product.name }))
}

export async function saveProduct(_prevState, formData) {
  await requireDashboardUser()

  const product = readPayload(formData)
  if (!product) return fail('The form could not be read. Reload and try again.')

  const fieldErrors = validate(product)
  if (Object.keys(fieldErrors).length) return fail('Check the highlighted fields.', fieldErrors)

  const id = product.id || null
  const slug = await uniqueSlug(product.slug || product.name, id)
  const row = fromProduct({ ...product, slug }, scoreFor(product, slug))

  const supabase = await createClient()

  if (id) {
    const { error } = await supabase.from('products').update(row).eq('id', id)
    if (error) return fail(friendlyDbError(error, CONSTRAINTS))

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
    return { ok: true, id, slug }
  }

  const { data, error } = await supabase.from('products').insert(row).select('id').single()
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))

  revalidatePath('/admin/products')
  return { ok: true, id: data.id, slug, created: true }
}

export async function deleteProduct(_prevState, formData) {
  await requireDashboardUser()

  const id = String(formData.get('id') ?? '')
  if (!id) return fail('Missing product id.')

  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))

  revalidatePath('/admin/products')
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

  revalidatePath('/admin/products')
  return { ok: true }
}
