import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/admin/seo'
import { dbResult, friendlyDbError } from './errors'

/**
 * Product data access.
 *
 * The wire shape (snake_case columns) never reaches a component — mappers below
 * translate in both directions, so a schema rename is a one-file change
 * (docs/CLAUDE.md §17).
 */

const num = (value) => (value === null || value === undefined || value === '' ? null : Number(value))

/** Database row -> the shape the dashboard works in. */
export function toProduct(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    slug: row.slug ?? '',
    sku: row.sku ?? '',
    brand: row.brand ?? '',
    category: row.category ?? '',
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    price: num(row.price) ?? 0,
    salePrice: num(row.sale_price),
    costPrice: num(row.cost_price),
    stock: row.stock ?? 0,
    stockStatus: row.stock_status ?? 'In stock',
    lowStockAlert: row.low_stock_alert ?? 5,
    featuredImage: row.featured_image ?? '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
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

/** Dashboard shape -> database row. */
export function fromProduct(product, seoScoreValue = 0) {
  const seo = product.seo ?? {}
  return {
    name: product.name?.trim() ?? '',
    slug: product.slug?.trim() ?? '',
    sku: product.sku?.trim() || null,
    brand: product.brand?.trim() || null,
    category: product.category?.trim() || null,
    short_description: product.shortDescription?.trim() || null,
    description: product.description?.trim() || null,
    price: num(product.price) ?? 0,
    sale_price: num(product.salePrice),
    cost_price: num(product.costPrice),
    stock: Number(product.stock) || 0,
    stock_status: product.stockStatus || 'In stock',
    low_stock_alert: Number(product.lowStockAlert) || 0,
    featured_image: product.featuredImage || null,
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
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

export async function listProducts({ query = '', status = '', page = 1, pageSize = 10 } = {}) {
  const supabase = await createClient()
  let request = supabase.from('products').select('*', { count: 'exact' })

  if (query.trim()) {
    const term = `%${query.trim()}%`
    request = request.or(`name.ilike.${term},sku.ilike.${term},slug.ilike.${term}`)
  }
  if (status) request = request.eq('status', status)

  const from = (page - 1) * pageSize
  const { data, error, count } = await request
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) return dbResult({ error })
  return dbResult({ rows: (data ?? []).map(toProduct), total: count ?? 0 })
}

export async function getProduct(id) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()

  if (error) return { product: null, error: friendlyDbError(error) }
  return { product: data ? toProduct(data) : null, error: null }
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
