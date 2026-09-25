/**
 * Storefront catalogue configuration — filters, sorting, collections.
 * Configuration, not business data: products and categories come from the
 * database (lib/catalog).
 */

/** Price filter buckets, in rupees. */
export const PRICE_RANGES = [
  { id: 'under-2000', label: 'Under ₹2,000', min: 0, max: 2000 },
  { id: '2000-5000', label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { id: '5000-10000', label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { id: 'over-10000', label: 'Over ₹10,000', min: 10000, max: Infinity },
]

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
]

export const PAGE_SIZE = 12

/** Products created within this many days carry the "New" badge. */
export const NEW_PRODUCT_DAYS = 30

/**
 * Collections are rules over live product data, not hand-kept lists, so they
 * can never go stale. "Best Sellers" arrives with order data in a later phase;
 * until then its URL shows the Featured edit rather than an invented ranking.
 */
export const COLLECTIONS = [
  {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    eyebrow: 'THE CUTTING EDGE',
    description: 'The latest additions to the range, newest first.',
    match: () => true,
    sort: 'newest',
    limit: 24,
  },
  {
    slug: 'featured',
    title: 'Featured Collection',
    eyebrow: 'ELEGANCE REFINED',
    description: 'A hand-picked edit of the pieces we are proudest of.',
    match: (product) => product.isFeatured,
  },
  {
    slug: 'sale',
    title: 'Sale',
    eyebrow: 'LIMITED REDUCTION',
    description: 'Current reductions across the range. Prices shown are final.',
    match: (product) => product.discount > 0,
  },
]

/** Old URL kept working: shows the Featured edit until sales data exists. */
export const COLLECTION_ALIASES = { 'best-sellers': 'featured' }

export function getCollectionConfig(slug) {
  const target = COLLECTION_ALIASES[slug] ?? slug
  return COLLECTIONS.find((collection) => collection.slug === target) ?? null
}
