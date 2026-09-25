import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/admin/seo'
import { dbResult, friendlyDbError } from './errors'

/**
 * Product data access for the dashboard.
 *
 * The wire shape (snake_case columns) never reaches a component — mappers below
 * translate in both directions, so a schema rename is a one-file change
 * (docs/CLAUDE.md §17).
 *
 * Cost and wholesale prices live in product_trade_prices (admin-only RLS) and
 * variants in product_variants; both are embedded here and saved by
 * lib/actions/products.js.
 */

const num = (value) => (value === null || value === undefined || value === '' ? null : Number(value))

/** PostgREST returns a one-to-one embed as an object, older versions as an array. */
const one = (value) => (Array.isArray(value) ? value[0] ?? null : value ?? null)

function toVariant(row) {
  return {
    id: row.id,
    optionName: row.option_name ?? 'Colour',
    value: row.value ?? '',
    sku: row.sku ?? '',
    price: num(row.price),
    salePrice: num(row.sale_price),
    stock: row.stock ?? 0,
    imageUrl: row.image_url ?? '',
    isActive: row.is_active ?? true,
    sortOrder: row.sort_order ?? 0,
  }
}

/** Database row -> the shape the dashboard works in. */
export function toProduct(row) {
  const trade = one(row.trade)
  const category = one(row.category)
  const variants = (row.variants ?? []).map(toVariant).sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id: row.id,
    name: row.name ?? '',
    slug: row.slug ?? '',
    sku: row.sku ?? '',
    brand: row.brand ?? '',
    categoryId: row.category_id ?? '',
    categoryName: category?.name ?? '',
    material: row.material ?? '',
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    price: num(row.price) ?? 0,
    salePrice: num(row.sale_price),
    costPrice: num(trade?.cost_price),
    wholesalePrice: num(trade?.wholesale_price),
    wholesaleMinQty: trade?.wholesale_min_qty ?? null,
    stock: row.stock ?? 0,
    stockStatus: row.stock_status ?? 'In stock',
    lowStockAlert: row.low_stock_alert ?? 5,
    hasVariants: variants.length > 0,
    optionName: variants[0]?.optionName ?? 'Colour',
    variants,
    featuredImage: row.featured_image ?? '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    isFeatured: Boolean(row.is_featured),
    seo: {
      title: row.seo_title ?? '',
      description: row.meta_description ?? '',
      keywords: row.meta_keywords ?? '',
      canonical: row.canonical_url ?? '',
      robots: row.meta_robots ?? 'index, follow',
      focusKeyword: row.focus_keyword ?? '',
      ogTitle: row.og_title ?? '',
      ogDescription: row.og_description ?? '',
      ogImage: row.og_image ?? '',
      twitterTitle: row.twitter_title ?? '',
      twitterDescription: row.twitter_description ?? '',
      twitterImage: row.twitter_image ?? '',
      slug: row.slug ?? '',
      index: !String(row.meta_robots ?? '').startsWith('noindex'),
      follow: !String(row.meta_robots ?? '').includes('nofollow'),
    },
    seoScore: row.seo_score ?? 0,
    status: row.status ?? 'Draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Dashboard shape -> products row. Stock status is derived by the database. */
export function fromProduct(product, seoScoreValue = 0) {
  const seo = product.seo ?? {}
  const specifications = (product.specifications ?? [])
    .map((spec) => ({ label: String(spec.label ?? '').trim(), value: String(spec.value ?? '').trim() }))
    .filter((spec) => spec.label && spec.value)

  return {
    name: product.name?.trim() ?? '',
    slug: product.slug?.trim() ?? '',
    sku: product.sku?.trim() || null,
    brand: product.brand?.trim() || null,
    category_id: product.categoryId || null,
    material: product.material?.trim() || null,
    short_description: product.shortDescription?.trim() || null,
    description: product.description?.trim() || null,
    specifications,
    price: num(product.price) ?? 0,
    sale_price: num(product.salePrice),
    stock: Number(product.stock) || 0,
    low_stock_alert: Number(product.lowStockAlert) || 0,
    featured_image: product.featuredImage || null,
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    is_featured: Boolean(product.isFeatured),
    seo_title: seo.title || null,
    meta_description: seo.description || null,
    meta_keywords: seo.keywords || null,
    canonical_url: seo.canonical || null,
    meta_robots: seo.robots || 'index, follow',
    focus_keyword: seo.focusKeyword || null,
    og_title: seo.ogTitle || null,
    og_description: seo.ogDescription || null,
    og_image: seo.ogImage || null,
    twitter_title: seo.twitterTitle || null,
    twitter_description: seo.twitterDescription || null,
    twitter_image: seo.twitterImage || null,
    seo_score: seoScoreValue,
    status: product.status || 'Draft',
  }
}

export function fromTradePrices(product) {
  const wholesale = num(product.wholesalePrice)
  return {
    cost_price: num(product.costPrice),
    wholesale_price: wholesale,
    wholesale_min_qty: wholesale === null ? null : Number(product.wholesaleMinQty) || null,
  }
}

export function fromVariant(variant, productId, optionName, index) {
  return {
    ...(variant.id ? { id: variant.id } : {}),
    product_id: productId,
    option_name: optionName?.trim() || 'Colour',
    value: String(variant.value ?? '').trim(),
    sku: variant.sku?.trim() || null,
    price: num(variant.price),
    sale_price: num(variant.salePrice),
    stock: Number(variant.stock) || 0,
    image_url: variant.imageUrl || null,
    is_active: variant.isActive !== false,
    sort_order: index,
  }
}

const LIST_COLUMNS = '*, category:categories(id, name)'

/**
 * `stock`: '' | 'low' | 'out' — the Inventory screen's filter. "Low" means at
 * or below the product's own alert level, which the database already folds
 * into stock_status.
 */
export async function listProducts({ query = '', status = '', categoryId = '', stock = '', page = 1, pageSize = 10, order = 'created', withVariants = false } = {}) {
  const supabase = await createClient()
  const columns = withVariants ? `${LIST_COLUMNS}, variants:product_variants(id, option_name, value, sku, stock, is_active, sort_order)` : LIST_COLUMNS
  let request = supabase.from('products').select(columns, { count: 'exact' })

  if (query.trim()) {
    const term = `%${query.trim().replace(/[%,()]/g, ' ')}%`
    request = request.or(`name.ilike.${term},sku.ilike.${term},slug.ilike.${term}`)
  }
  if (status) request = request.eq('status', status)
  if (categoryId) request = request.eq('category_id', categoryId)
  if (stock === 'low') request = request.eq('stock_status', 'Low stock')
  if (stock === 'out') request = request.eq('stock_status', 'Out of stock')
  if (stock === 'attention') request = request.in('stock_status', ['Low stock', 'Out of stock'])

  request = order === 'stock'
    ? request.order('stock', { ascending: true }).order('name')
    : request.order('created_at', { ascending: false })

  const from = (page - 1) * pageSize
  const { data, error, count } = await request.range(from, from + pageSize - 1)

  if (error) return dbResult({ error })
  return dbResult({ rows: (data ?? []).map(toProduct), total: count ?? 0 })
}

export async function getProduct(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, parent_id), variants:product_variants(*), trade:product_trade_prices(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) return { product: null, error: friendlyDbError(error) }
  return { product: data ? toProduct(data) : null, error: null }
}

/** Distinct brand names already in use — suggestions for the brand field. */
export async function listBrands() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('brand').not('brand', 'is', null).limit(2000)
  return [...new Set((data ?? []).map((row) => row.brand).filter(Boolean))].sort()
}

/** Headline numbers for the dashboard home. */
export async function productStats() {
  const supabase = await createClient()
  const count = async (build) => {
    const { count: total, error } = await build(supabase.from('products').select('id', { count: 'exact', head: true }))
    return error ? null : total ?? 0
  }
  const [published, drafts, low, out] = await Promise.all([
    count((q) => q.eq('status', 'Published')),
    count((q) => q.eq('status', 'Draft')),
    count((q) => q.eq('stock_status', 'Low stock')),
    count((q) => q.eq('stock_status', 'Out of stock')),
  ])
  return { published, drafts, low, out }
}

/**
 * A slug that is free.
 *
 * The unique index is the real guarantee — this only avoids showing the user a
 * constraint error for something the app can resolve itself. `excludeId` keeps
 * a product from colliding with its own slug while being edited.
 */
export async function uniqueSlug(desired, excludeId = null) {
  const supabase = await createClient()
  const base = slugify(desired) || 'product'

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    let request = supabase.from('products').select('id').eq('slug', candidate)
    if (excludeId) request = request.neq('id', excludeId)

    const { data, error } = await request.limit(1)
    if (error) return candidate // let the insert surface the real problem
    if (!data?.length) return candidate
  }
  return `${base}-${Date.now()}`
}
