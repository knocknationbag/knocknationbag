import { categories } from './categories'

/** Product lines, presented as brands in filters and on the PDP. */
export const brands = [
  { id: 'knb-atelier', name: 'KNB Atelier', description: 'Hand-finished leather goods.' },
  { id: 'knb-voyage', name: 'KNB Voyage', description: 'Luggage and travel systems.' },
  { id: 'knb-field', name: 'KNB Field', description: 'Technical everyday carry.' },
  { id: 'knb-executive', name: 'KNB Executive', description: 'Formal business carry.' },
]

export const collections = [
  {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    eyebrow: 'THE CUTTING EDGE',
    description:
      'The most recent additions to the range — released as they leave the workshop, not on a seasonal calendar.',
    image: '/images/products/aero-shell-suitcase.webp',
    imageAlt: 'Aero Shell Suitcase bronze hardshell case on a marble plinth',
    match: (p) => p.collections.includes('new') || p.collections.includes('new-featured'),
  },
  {
    slug: 'best-sellers',
    title: 'Best Sellers',
    eyebrow: 'ELITE FAVORITES',
    description:
      'The pieces our customers return for. Ranked by verified review volume across the last twelve months.',
    image: '/images/products/executive-messenger.webp',
    imageAlt: 'Executive Messenger black leather satchel with brass buckles',
    match: (p) => p.reviewCount >= 100,
  },
  {
    slug: 'featured',
    title: 'Featured Collection',
    eyebrow: 'ELEGANCE REFINED',
    description:
      'A curated edit of the pieces that best express what the brand is for: structure, utility and restraint.',
    image: '/images/products/monarch-leather-tote.webp',
    imageAlt: 'Monarch Leather Tote in tan leather with tall handles',
    match: (p) => p.collections.includes('featured'),
  },
  {
    slug: 'sale',
    title: 'Sale',
    eyebrow: 'LIMITED REDUCTION',
    description:
      'Current reductions across the range. Prices shown are final — no code required at checkout.',
    image: '/images/products/atlas-shell-roller.webp',
    imageAlt: 'Atlas Shell Roller green ribbed hardshell suitcase',
    match: (p) => p.discount > 0,
  },
]

export function getCollection(slug) {
  return collections.find((c) => c.slug === slug) ?? null
}

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug) ?? null
}

/** Filter facets rendered by FilterSidebar. Values are derived from the catalogue. */
export const PRICE_RANGES = [
  { id: 'under-100', label: 'Under $100', min: 0, max: 100 },
  { id: '100-200', label: '$100 – $200', min: 100, max: 200 },
  { id: '200-300', label: '$200 – $300', min: 200, max: 300 },
  { id: 'over-300', label: 'Over $300', min: 300, max: Infinity },
]

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
  { id: 'newest', label: 'Newest' },
]

export const PAGE_SIZE = 12
