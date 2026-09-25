import 'server-only'

import { cache } from 'react'

import { createPublicClient } from '@/lib/supabase/public'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { NEW_PRODUCT_DAYS, getCollectionConfig } from '@/constants/catalog'
import { sortProducts } from '@/utils/catalog'
import { STORE_CURRENCY } from '@/utils/formatPrice'

/**
 * The storefront catalogue, read from Supabase.
 *
 * Reads go through the anonymous cached client (lib/supabase/public.js), so RLS
 * returns only Published products and Active categories, and pages stay
 * statically renderable. Rows are mapped to the storefront product shape the
 * components were built against (docs/architecture.md §4.1) — a schema change
 * is a change here, not in twenty components.
 *
 * V1 loads the whole published catalogue in one query and filters in memory
 * (utils/catalog.js). That is simple and fast into the low thousands of
 * products; past that, move filtering into the query.
 */

export const PLACEHOLDER_IMAGE = '/images/placeholder-bag.svg'

const PRODUCT_COLUMNS = [
  'id', 'name', 'slug', 'sku', 'brand', 'short_description', 'description',
  'price', 'sale_price', 'stock', 'stock_status', 'low_stock_alert',
  'featured_image', 'gallery', 'material', 'specifications', 'is_featured',
  'seo_title', 'meta_description', 'canonical_url', 'meta_robots', 'og_title', 'og_description', 'og_image',
  'created_at',
  'category:categories(id, name, slug, parent_id)',
  'variants:product_variants(id, option_name, value, sku, price, sale_price, stock, image_url, sort_order)',
].join(', ')

const num = (value) => (value === null || value === undefined ? null : Number(value))

/** Selling price and the struck-through price, from a regular + optional sale price. */
function pricing(regular, sale) {
  const price = sale ?? regular
  const oldPrice = sale !== null && sale < regular ? regular : null
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0
  return { price, oldPrice, discount }
}

function toVariant(row, product) {
  const regular = num(row.price) ?? product.regularPrice
  const sale = row.price === null && row.sale_price === null ? product.salePrice : num(row.sale_price)
  return {
    id: row.id,
    optionName: row.option_name,
    value: row.value,
    sku: row.sku ?? '',
    ...pricing(regular, sale),
    stock: row.stock,
    inStock: row.stock > 0,
    image: row.image_url || null,
  }
}

/** Database row → the storefront product shape. */
export function toStoreProduct(row) {
  const regularPrice = num(row.price) ?? 0
  const salePrice = num(row.sale_price)
  const gallery = [row.featured_image, ...(Array.isArray(row.gallery) ? row.gallery : [])].filter(Boolean)
  const image = gallery[0] ?? PLACEHOLDER_IMAGE
  const ageDays = (Date.now() - new Date(row.created_at).getTime()) / 86400000

  const base = { regularPrice, salePrice }
  const variants = (row.variants ?? [])
    .sort((a, b) => a.sort_order - b.sort_order || a.value.localeCompare(b.value))
    .map((variant) => toVariant(variant, base))

  return {
    id: row.id,
    slug: row.slug,
    title: row.name,
    sku: row.sku ?? '',
    brand: row.brand ?? '',
    material: row.material ?? '',
    shortDescription: row.short_description ?? '',
    longDescription: row.description ?? '',
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    features: [],
    tags: [],
    currency: STORE_CURRENCY,
    ...pricing(regularPrice, salePrice),
    regularPrice,
    salePrice,
    image,
    imageAlt: row.name,
    gallery: gallery.length ? gallery : [PLACEHOLDER_IMAGE],
    stock: row.stock ?? 0,
    stockStatus: row.stock_status,
    inStock: (row.stock ?? 0) > 0,
    lowStock: row.stock_status === 'Low stock',
    // No review system in V1 — never show invented ratings.
    rating: null,
    reviewCount: 0,
    badge: ageDays <= NEW_PRODUCT_DAYS ? 'new' : null,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    category: row.category?.slug ?? null,
    categoryId: row.category?.id ?? null,
    categoryName: row.category?.name ?? null,
    categoryParentId: row.category?.parent_id ?? null,
    variants,
    optionName: variants[0]?.optionName ?? null,
    colors: variants.map((variant) => variant.value),
    seo: {
      title: row.seo_title || null,
      description: row.meta_description || row.short_description || null,
      canonical: row.canonical_url || null,
      robots: row.meta_robots || 'index, follow',
      ogTitle: row.og_title || null,
      ogDescription: row.og_description || null,
      ogImage: row.og_image || null,
    },
  }
}

function toStoreCategory(row) {
  return {
    id: row.id,
    parentId: row.parent_id,
    slug: row.slug,
    title: row.name,
    description: row.description ?? '',
    image: row.image_url || null,
    imageAlt: row.name,
    sortOrder: row.sort_order,
    seo: {
      title: row.seo_title || null,
      description: row.meta_description || row.description || null,
      ogImage: row.og_image || null,
    },
  }
}

/**
 * The whole published catalogue, once per request (React cache) and once per
 * hour or dashboard save across requests (fetch cache, see public.js).
 * Never throws: a database outage renders an empty shop, not a crashed site.
 */
export const getCatalog = cache(async () => {
  if (!isSupabaseConfigured()) return { products: [], categories: [], error: 'not-configured' }

  const supabase = createPublicClient()
  const [productsResult, categoriesResult] = await Promise.all([
    supabase.from('products').select(PRODUCT_COLUMNS).eq('status', 'Published').order('created_at', { ascending: false }).limit(2000),
    supabase.from('categories').select('*').order('sort_order').order('name'),
  ])

  const error = productsResult.error ?? categoriesResult.error
  if (error) console.error('Catalogue read failed:', error.message)

  const products = (productsResult.data ?? []).map(toStoreProduct)
  const categories = (categoriesResult.data ?? []).map(toStoreCategory)

  // A category without its own image borrows its first product's photo, so a
  // new category never renders an empty tile.
  for (const category of categories) {
    if (category.image) continue
    const ids = new Set([category.id, ...categories.filter((c) => c.parentId === category.id).map((c) => c.id)])
    category.image = products.find((p) => ids.has(p.categoryId) && p.image !== PLACEHOLDER_IMAGE)?.image ?? PLACEHOLDER_IMAGE
  }

  return { products, categories, error: error ? error.message : null }
})

/** Top-level categories with their children and product counts. */
export async function getCategoryTree() {
  const { categories, products } = await getCatalog()
  const countFor = (ids) => products.filter((p) => ids.includes(p.categoryId)).length

  return categories
    .filter((category) => !category.parentId)
    .map((category) => {
      const children = categories
        .filter((child) => child.parentId === category.id)
        .map((child) => ({ ...child, productCount: countFor([child.id]) }))
      return { ...category, children, productCount: countFor([category.id, ...children.map((c) => c.id)]) }
    })
}

export async function getCategoryBySlug(slug) {
  const { categories } = await getCatalog()
  const category = categories.find((c) => c.slug === slug)
  if (!category) return null

  return {
    ...category,
    parent: category.parentId ? categories.find((c) => c.id === category.parentId) ?? null : null,
    children: categories.filter((c) => c.parentId === category.id),
  }
}

/** Products in a category, including its subcategories. */
export async function getProductsInCategory(category) {
  const { products } = await getCatalog()
  const ids = new Set([category.id, ...(category.children ?? []).map((c) => c.id)])
  return products.filter((p) => ids.has(p.categoryId))
}

export async function getProductBySlug(slug) {
  const { products } = await getCatalog()
  return products.find((p) => p.slug === slug) ?? null
}

/** Same category first, then same brand, then anything else in stock. */
export async function getRelatedProducts(product, limit = 4) {
  const { products } = await getCatalog()
  const others = products.filter((p) => p.id !== product.id)
  const score = (p) => (p.categoryId === product.categoryId ? 2 : 0) + (p.brand && p.brand === product.brand ? 1 : 0) + (p.inStock ? 0.5 : 0)
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit)
}

export async function getCollectionProducts(slug) {
  const config = getCollectionConfig(slug)
  if (!config) return null
  const { products } = await getCatalog()
  const matched = sortProducts(products.filter(config.match), config.sort ?? 'featured')
  return { collection: config, products: config.limit ? matched.slice(0, config.limit) : matched }
}
