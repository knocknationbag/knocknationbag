/**
 * The canonical SEO field set.
 *
 * SEO is a day-one requirement (Phase 3 brief), so every content type —
 * product, category, collection, CMS page, blog post — stores exactly this
 * shape. One definition means a new content type inherits full SEO support with
 * no extra UI work, and the validator below applies everywhere.
 */

export const ROBOTS_PRESETS = [
  'index, follow',
  'index, nofollow',
  'noindex, follow',
  'noindex, nofollow',
]

export const SCHEMA_TYPES = [
  'Product', 'Article', 'BlogPosting', 'WebPage', 'CollectionPage',
  'BreadcrumbList', 'FAQPage', 'Organization', 'LocalBusiness', 'ItemList',
]

/** Recommended vs hard limits. Drives the character counters. */
export const SEO_LIMITS = {
  title: { ideal: 60, max: 70 },
  description: { ideal: 155, max: 320 },
  ogTitle: { ideal: 60, max: 88 },
  ogDescription: { ideal: 110, max: 200 },
  twitterTitle: { ideal: 60, max: 70 },
  twitterDescription: { ideal: 120, max: 200 },
  breadcrumbTitle: { ideal: 30, max: 60 },
  keywords: { ideal: 120, max: 255 },
  altText: { ideal: 100, max: 125 },
}

export function emptySeo(overrides = {}) {
  return {
    // Search
    title: '',
    description: '',
    slug: '',
    keywords: '',
    focusKeyword: '',
    breadcrumbTitle: '',
    // Social
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    // Advanced
    canonical: '',
    robots: 'index, follow',
    index: true,
    follow: true,
    schemaType: 'WebPage',
    structuredData: '',
    redirectFrom: '',
    redirectType: '301',
    // Image SEO
    altText: '',
    imageTitle: '',
    imageCaption: '',
    imageDescription: '',
    ...overrides,
  }
}

/**
 * Validation rules. Returns [{ id, level, message }] where level is
 * 'error' | 'warning' | 'pass'. Deliberately pure so the same rules can run
 * server-side later without touching the UI.
 */
export function validateSeo(seo, { baseUrl = 'https://knocknationbag.com', pathPrefix = 'product' } = {}) {
  const checks = []
  const push = (id, level, message) => checks.push({ id, level, message })
  const kw = seo.focusKeyword?.trim().toLowerCase()

  // Title
  if (!seo.title?.trim()) push('title', 'error', 'SEO title is missing.')
  else if (seo.title.length > SEO_LIMITS.title.max) push('title', 'error', `SEO title is ${seo.title.length} characters — Google truncates past ${SEO_LIMITS.title.ideal}.`)
  else if (seo.title.length > SEO_LIMITS.title.ideal) push('title', 'warning', `SEO title is ${seo.title.length} characters — aim for ${SEO_LIMITS.title.ideal} or fewer.`)
  else push('title', 'pass', 'SEO title length is good.')

  // Description
  if (!seo.description?.trim()) push('description', 'error', 'Meta description is missing.')
  else if (seo.description.length < 70) push('description', 'warning', 'Meta description is short — 120–155 characters performs best.')
  else if (seo.description.length > SEO_LIMITS.description.ideal) push('description', 'warning', `Meta description is ${seo.description.length} characters — it will be truncated.`)
  else push('description', 'pass', 'Meta description length is good.')

  // Slug
  if (!seo.slug?.trim()) push('slug', 'error', 'Slug is missing.')
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(seo.slug)) push('slug', 'error', 'Slug must be lowercase, hyphen-separated, no spaces or special characters.')
  else if (seo.slug.length > 60) push('slug', 'warning', 'Slug is long — shorter URLs are easier to share.')
  else push('slug', 'pass', 'Slug is well formed.')

  // Focus keyword coverage
  if (!kw) push('keyword', 'warning', 'No focus keyword set — add one to enable keyword checks.')
  else {
    const inTitle = seo.title?.toLowerCase().includes(kw)
    const inDesc = seo.description?.toLowerCase().includes(kw)
    const inSlug = seo.slug?.toLowerCase().includes(kw.replace(/\s+/g, '-'))
    if (inTitle && inDesc && inSlug) push('keyword', 'pass', 'Focus keyword appears in the title, description and slug.')
    else {
      const missing = [!inTitle && 'title', !inDesc && 'description', !inSlug && 'slug'].filter(Boolean)
      push('keyword', 'warning', `Focus keyword is missing from the ${missing.join(', ')}.`)
    }
  }

  // Keywords. Google ignores the tag, but Bing and several site-search engines
  // still read it, and it doubles as the editor's own record of intent.
  if (!seo.keywords?.trim()) push('keywords', 'warning', 'No meta keywords set.')
  else if (seo.keywords.split(',').filter((k) => k.trim()).length > 10) {
    push('keywords', 'warning', 'More than 10 keywords reads as stuffing — keep the list tight.')
  } else push('keywords', 'pass', 'Meta keywords are set.')

  // Indexability
  if (!seo.index) push('robots', 'warning', 'This page is set to noindex — it will not appear in search results.')
  else push('robots', 'pass', 'Page is indexable.')

  // Canonical
  if (seo.canonical && !/^https?:\/\//.test(seo.canonical)) push('canonical', 'error', 'Canonical URL must be absolute, including https://.')
  else if (!seo.canonical) push('canonical', 'warning', `No canonical set — ${autoCanonical(seo.slug, baseUrl, pathPrefix) || `${baseUrl}/…`} will be assumed.`)
  else push('canonical', 'pass', 'Canonical URL is set.')

  // Social
  if (!seo.ogImage) push('ogImage', 'warning', 'No Open Graph image — links will share without a preview card.')
  else push('ogImage', 'pass', 'Open Graph image is set.')

  if (!seo.ogTitle && !seo.title) push('ogTitle', 'warning', 'No Open Graph title and no SEO title to fall back on.')

  // Structured data
  if (seo.structuredData?.trim()) {
    try {
      JSON.parse(seo.structuredData)
      push('schema', 'pass', 'Structured data is valid JSON.')
    } catch {
      push('schema', 'error', 'Structured data is not valid JSON.')
    }
  } else push('schema', 'warning', `No structured data — ${seo.schemaType} markup would improve rich results.`)

  // Image SEO
  if (!seo.altText?.trim()) push('alt', 'warning', 'Primary image has no alt text — required for accessibility and image search.')
  else if (seo.altText.length > SEO_LIMITS.altText.max) push('alt', 'warning', `Alt text is ${seo.altText.length} characters — keep it under ${SEO_LIMITS.altText.max}.`)
  else push('alt', 'pass', 'Alt text is set.')

  return checks
}

/** 0–100 readiness score. Errors cost more than warnings. */
export function seoScore(checks) {
  if (!checks.length) return 0
  const errors = checks.filter((c) => c.level === 'error').length
  const warnings = checks.filter((c) => c.level === 'warning').length
  const raw = 100 - errors * 15 - warnings * 6
  return Math.max(0, Math.min(100, raw))
}

/** Slugify helper shared by the SEO panel and future importers. */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * The URL a record gets when the canonical field is left empty.
 *
 * Validation, the Google preview and the editor all call this, so the URL the
 * tool reports is always the URL that will actually be used — an SEO panel that
 * predicts the wrong canonical is worse than one that predicts none.
 */
export function autoCanonical(slug, baseUrl = 'https://knocknationbag.com', pathPrefix = 'product') {
  if (!slug) return ''
  return [baseUrl, pathPrefix, slug].filter(Boolean).join('/')
}

/**
 * Product JSON-LD, generated from the record rather than hand-written.
 *
 * Structured data that is typed by hand drifts from the page the moment a price
 * changes, and Google penalises markup that disagrees with visible content —
 * so this is derived and shown read-only.
 */
export function productJsonLd(product, { baseUrl = 'https://knocknationbag.com' } = {}) {
  const seo = product.seo ?? {}
  const price = product.salePrice ?? product.price
  const url = seo.canonical || autoCanonical(product.slug, baseUrl)
  const images = [product.featuredImage, ...(product.gallery ?? [])]
    .filter(Boolean)
    .map((src) => (src.startsWith('http') ? src : `${baseUrl}${src}`))

  const availability = {
    'In stock': 'https://schema.org/InStock',
    'Low stock': 'https://schema.org/LimitedAvailability',
    'Out of stock': 'https://schema.org/OutOfStock',
    Backorder: 'https://schema.org/BackOrder',
  }[product.stockStatus] ?? 'https://schema.org/InStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || undefined,
    description: seo.description || product.shortDescription || undefined,
    sku: product.sku || undefined,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(images.length ? { image: images } : {}),
    ...(url ? { url } : {}),
    offers: {
      '@type': 'Offer',
      price: Number(price ?? 0).toFixed(2),
      priceCurrency: 'USD',
      availability,
      ...(url ? { url } : {}),
    },
  }
}
