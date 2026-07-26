import { PAGE_SIZE, PRICE_RANGES } from '@/data/catalog'

/** Always return an array, whether searchParams gave a string, array or nothing. */
export function toArray(value) {
  if (value === undefined || value === null || value === '') return []
  return Array.isArray(value) ? value : String(value).split(',').filter(Boolean)
}

/**
 * Apply filter facets from the URL. Filters are URL state so results stay
 * shareable, bookmarkable and crawlable (docs/CLAUDE.md §14).
 */
export function filterProducts(products, params = {}) {
  const brands = toArray(params.brand)
  const colors = toArray(params.color)
  const materials = toArray(params.material)
  const price = toArray(params.price)
  const inStockOnly = params.stock === 'in'

  return products.filter((product) => {
    if (brands.length && !brands.includes(product.brand)) return false
    if (colors.length && !colors.includes(product.color)) return false
    if (materials.length && !materials.includes(product.material)) return false
    if (inStockOnly && !product.inStock) return false
    if (price.length) {
      const inAnyRange = price.some((id) => {
        const range = PRICE_RANGES.find((r) => r.id === id)
        return range && product.price >= range.min && product.price < range.max
      })
      if (!inAnyRange) return false
    }
    return true
  })
}

export function sortProducts(products, sort = 'featured') {
  const list = [...products]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    case 'newest':
      return list.sort(
        (a, b) => Number(b.collections.includes('new')) - Number(a.collections.includes('new')),
      )
    default:
      return list
  }
}

export function paginate(items, page = 1, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages)
  const start = (current - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
  }
}

/** Build the facet lists actually present in a given product set. */
export function buildFacets(products) {
  const uniq = (key) => [...new Set(products.map((p) => p[key]))].sort()
  return {
    brands: uniq('brand'),
    colors: uniq('color'),
    materials: uniq('material'),
  }
}

/** Case-insensitive match across the fields a shopper would actually type. */
export function searchProducts(products, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return []
  return products.filter((p) =>
    [p.title, p.brand, p.category, p.color, p.material, ...p.tags]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}

/** Preserve existing query params while changing one of them. */
export function buildQuery(current = {}, changes = {}) {
  const params = new URLSearchParams()
  const merged = { ...current, ...changes }
  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    params.set(key, Array.isArray(value) ? value.join(',') : String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
