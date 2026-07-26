import { emptySeo } from './seo'

/**
 * Initial product-form state.
 *
 * Kept out of the component so the create, edit and duplicate routes all start
 * from one definition — a new field is added in exactly one place, and duplicate
 * cannot silently drift from edit.
 */
export function buildProductFormState(product = null, { categories, brands, duplicate = false } = {}) {
  const specs = (product?.specifications ?? []).map((s, i) => ({
    id: `s${i}`, key: s.label, value: s.value,
  }))

  const gallery = (product?.gallery ?? (product?.image ? [product.image] : [])).map((src, i) => ({
    id: `g${i}`,
    src,
    alt: i === 0 ? (product?.imageAlt ?? '') : '',
    title: '',
    caption: '',
    description: '',
  }))

  return {
    title: duplicate ? `${product?.title ?? ''} (copy)` : product?.title ?? '',
    slug: duplicate ? `${product?.slug ?? ''}-copy` : product?.slug ?? '',
    subtitle: '',
    shortDescription: product?.shortDescription ?? '',
    longDescription: product?.longDescription ?? '',
    featuresText: (product?.features ?? []).join('\n'),

    price: product?.price ?? '',
    oldPrice: product?.oldPrice ?? '',
    cost: '',
    taxClass: 'Standard',
    taxable: true,
    onSale: Boolean(product?.discount),

    sku: product ? `KNB-${String(product.slug ?? '').slice(0, 6).toUpperCase()}` : '',
    barcode: '',
    stock: product?.stock ?? 0,
    lowStockThreshold: 10,
    location: 'Lisbon workshop',
    trackInventory: true,
    backorder: false,

    category: product?.category ?? categories?.[0]?.slug ?? '',
    brand: product?.brand ?? brands?.[0]?.name ?? '',
    collectionSlugs: [],
    tags: product?.tags ?? [],

    specs,
    attributes: product?.color
      ? [{ id: 'a0', key: 'Colour', value: product.color }, { id: 'a1', key: 'Material', value: product.material ?? '' }]
      : [],
    variants: [],

    weight: '', length: '', width: '', height: '',
    shippingClass: 'Standard',
    origin: 'Portugal',
    freeShipping: false,
    requiresShipping: true,

    related: [],
    crossSell: [],
    upsell: [],

    // A duplicate must never go live by accident.
    status: duplicate ? 'Draft' : product?.status ?? 'Draft',
    publishAt: '',
    featured: duplicate ? false : product?.featured ?? false,
    visibility: 'Visible everywhere',
    requiresLogin: false,

    gallery,
  }
}

export function buildProductSeoState(product = null, { duplicate = false } = {}) {
  return emptySeo({
    title: duplicate ? '' : product?.title ?? '',
    slug: duplicate ? `${product?.slug ?? ''}-copy` : product?.slug ?? '',
    description: duplicate ? '' : product?.shortDescription ?? '',
    altText: product?.imageAlt ?? '',
    schemaType: 'Product',
    ogImage: product?.image ?? '',
    // A duplicate must not compete with its original in search until edited.
    index: !duplicate,
    robots: duplicate ? 'noindex, follow' : 'index, follow',
  })
}

/**
 * Static child routes under /admin/products shadow the [slug] segment, so a
 * product with one of these slugs would be unreachable for editing. Excluded
 * from generateStaticParams and worth validating on slug entry later.
 */
export const RESERVED_PRODUCT_SLUGS = ['new', 'drafts', 'archived']

export const PRODUCT_FORM_TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'organisation', label: 'Organisation' },
  { id: 'media', label: 'Media' },
  { id: 'description', label: 'Description' },
  { id: 'specs', label: 'Specs & attributes' },
  { id: 'variants', label: 'Variants' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'related', label: 'Related' },
  { id: 'seo', label: 'SEO' },
]
