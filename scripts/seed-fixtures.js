/**
 * Development fixtures — the data `seed-dev-data.js` writes to Supabase.
 *
 * Kept separate from the script that inserts it so the dataset can be read,
 * reviewed and extended without wading through Supabase plumbing.
 *
 * Nothing here is imported by the app. Components read the database through
 * lib/db/*, never this file — dummy data that lives in a component is dummy
 * data that ships (docs/CLAUDE.md §17).
 *
 * Conventions:
 *   - Emails use example.com. It is reserved by IANA and cannot receive mail,
 *     so a stray password-reset can never reach a real inbox.
 *   - Phone numbers use the 555-01xx range, reserved for fiction.
 *   - Images are the real assets already in public/ — a placeholder that is a
 *     broken URL tells you nothing about how the dashboard actually looks.
 *   - `daysAgo` staggers created_at so the lists have a believable order and
 *     pagination is deterministic rather than dependent on insert speed.
 */

const CATEGORY_SKU = {
  backpack: 'BKP',
  laptop: 'LTP',
  travel: 'TRV',
  men: 'MEN',
  women: 'WMN',
  accessories: 'ACC',
  office: 'OFF',
  school: 'SCH',
}

/** Below this, `stock` reads as Low stock — mirrors products.low_stock_alert. */
const LOW_STOCK_ALERT = 5

const image = (file) => `/images/products/${file}.webp`

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const users = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (415) 555-0142',
    avatarUrl: '/images/avatars/john-smith.webp',
    status: 'Active',
    daysAgo: 34,
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '+1 (415) 555-0178',
    avatarUrl: '/images/avatars/emma-wilson.webp',
    status: 'Active',
    daysAgo: 21,
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1 (415) 555-0119',
    avatarUrl: '/images/avatars/michael-brown.webp',
    status: 'Inactive',
    daysAgo: 9,
  },
]

// ---------------------------------------------------------------------------
// Products
//
// `focusKeyword` appears in the name, the description and therefore the slug —
// that is what the SEO validator scores, so the scores the dashboard shows are
// earned rather than invented.
// ---------------------------------------------------------------------------

const products = [
  {
    name: 'Monarch Leather Backpack',
    brand: 'KNB Atelier', category: 'backpack', price: 289, salePrice: 239, stock: 18,
    status: 'Published', file: 'rosewood-daypack', focusKeyword: 'leather backpack', daysAgo: 2,
    shortDescription: 'Full-grain leather backpack with a padded 15-inch laptop bay and solid brass hardware.',
  },
  {
    name: 'Executive Office Laptop Bag',
    brand: 'KNB Executive', category: 'laptop', price: 219, salePrice: null, stock: 24,
    status: 'Published', file: 'executive-messenger', focusKeyword: 'office laptop bag', daysAgo: 3,
    shortDescription: 'Structured office laptop bag that holds a 16-inch machine, documents and a change of shirt.',
  },
  {
    name: 'Apex Travel Duffel',
    brand: 'KNB Voyage', category: 'travel', price: 249, salePrice: 199, stock: 12,
    status: 'Published', file: 'apex-duffle-pro', focusKeyword: 'travel duffel', daysAgo: 4,
    shortDescription: 'A 45-litre travel duffel that clears a carry-on gate and still holds three days of tailoring.',
  },
  {
    name: 'Signature Leather Sling Bag',
    brand: 'KNB Atelier', category: 'men', price: 139, salePrice: null, stock: 31,
    status: 'Published', file: 'signature-leather-sling', focusKeyword: 'sling bag', daysAgo: 5,
    shortDescription: 'Single-strap sling bag in vegetable-tanned leather, cut close to the body for city days.',
  },
  {
    name: 'Teal Structured Tote Bag',
    brand: 'KNB Atelier', category: 'women', price: 199, salePrice: 169, stock: 9,
    status: 'Published', file: 'teal-structured-tote', focusKeyword: 'tote bag', daysAgo: 6,
    shortDescription: 'Structured tote bag in pebbled calf leather, wide enough for a laptop and a lunch.',
  },
  {
    name: 'Ivory Top Handle Handbag',
    brand: 'KNB Atelier', category: 'women', price: 269, salePrice: null, stock: 7,
    status: 'Published', file: 'ivory-top-handle', focusKeyword: 'handbag', daysAgo: 7,
    shortDescription: 'Top-handle handbag with a magnetic flap, suede lining and a detachable shoulder chain.',
  },
  {
    name: 'Field Canvas Messenger Bag',
    brand: 'KNB Field', category: 'men', price: 159, salePrice: 129, stock: 26,
    status: 'Published', file: 'field-canvas-messenger', focusKeyword: 'messenger bag', daysAgo: 8,
    shortDescription: 'Waxed canvas messenger bag with leather trim and a weatherproof storm flap over the buckles.',
  },
  {
    name: 'Velocity Gym Bag',
    brand: 'KNB Field', category: 'travel', price: 119, salePrice: null, stock: 42,
    status: 'Published', file: 'apex-duffle-pro', focusKeyword: 'gym bag', daysAgo: 9,
    shortDescription: 'Ventilated gym bag with a wipe-clean base, a separate shoe tunnel and a sealed wet-kit pocket.',
  },
  {
    name: 'Atlas Cabin Trolley',
    brand: 'KNB Voyage', category: 'travel', price: 349, salePrice: 299, stock: 5,
    status: 'Published', file: 'atlas-shell-roller', focusKeyword: 'cabin trolley', daysAgo: 10,
    shortDescription: 'Polycarbonate cabin trolley with silent spinner wheels and a TSA-approved combination lock.',
  },
  {
    name: 'Meridian Weekender Bag',
    brand: 'KNB Voyage', category: 'travel', price: 279, salePrice: null, stock: 14,
    status: 'Published', file: 'meridian-travel-pack', focusKeyword: 'weekender bag', daysAgo: 11,
    shortDescription: 'Two-day weekender bag with a suspended base panel and a removable padded shoulder strap.',
  },
  {
    name: 'Nova Crossbody Bag',
    brand: 'KNB Atelier', category: 'women', price: 129, salePrice: 99, stock: 38,
    status: 'Published', file: 'nova-crossbody', focusKeyword: 'crossbody bag', daysAgo: 12,
    shortDescription: 'Compact crossbody bag on an adjustable webbing strap, sized for a phone, cards and keys.',
  },
  {
    name: 'Heritage Bifold Wallet',
    brand: 'KNB Atelier', category: 'accessories', price: 89, salePrice: null, stock: 64,
    status: 'Published', file: 'blush-chain-clutch', focusKeyword: 'wallet', daysAgo: 13,
    shortDescription: 'Slim bifold wallet in full-grain leather with eight card slots and RFID shielding.',
  },
  {
    name: 'Nomad Laptop Sleeve',
    brand: 'KNB Executive', category: 'laptop', price: 99, salePrice: 79, stock: 47,
    status: 'Published', file: 'nomad-tech-folio', focusKeyword: 'laptop sleeve', daysAgo: 14,
    shortDescription: 'Felt-lined laptop sleeve with a magnetic closure, cut for 13 to 14-inch machines.',
  },
  {
    name: 'Equinox Business Backpack',
    brand: 'KNB Executive', category: 'office', price: 169, salePrice: null, stock: 22,
    status: 'Published', file: 'equinox-commuter', focusKeyword: 'business backpack', daysAgo: 15,
    shortDescription: 'Business backpack that opens flat at security and keeps a suit jacket uncreased.',
  },
  {
    name: 'Aperture Camera Bag',
    brand: 'KNB Field', category: 'accessories', price: 189, salePrice: 159, stock: 11,
    status: 'Published', file: 'field-canvas-messenger', focusKeyword: 'camera bag', daysAgo: 16,
    shortDescription: 'Camera bag with movable dividers for a body, two lenses and a 13-inch laptop.',
  },
  {
    name: 'Summit Hiking Backpack',
    brand: 'KNB Field', category: 'backpack', price: 229, salePrice: null, stock: 16,
    status: 'Published', file: 'helios-roll-top', focusKeyword: 'hiking backpack', daysAgo: 17,
    shortDescription: 'A 38-litre hiking backpack with a ventilated harness, a load-bearing hip belt and a rain cover.',
  },
  {
    name: 'Rosewood Fashion Backpack',
    brand: 'KNB Atelier', category: 'women', price: 179, salePrice: 149, stock: 20,
    status: 'Published', file: 'rosewood-daypack', focusKeyword: 'fashion backpack', daysAgo: 18,
    shortDescription: 'Fashion backpack in rosewood leather with convertible straps that carry it as a tote.',
  },
  {
    name: 'Cadet School Backpack',
    brand: 'KNB Field', category: 'school', price: 79, salePrice: null, stock: 55,
    status: 'Published', file: 'navy-city-backpack', focusKeyword: 'school backpack', daysAgo: 19,
    shortDescription: 'Hard-wearing school backpack with a padded tablet sleeve and reflective trim on every face.',
  },
  {
    name: 'Regent Premium Leather Bag',
    brand: 'KNB Atelier', category: 'men', price: 399, salePrice: 349, stock: 4,
    status: 'Published', file: 'monarch-leather-tote', focusKeyword: 'premium leather bag', daysAgo: 20,
    shortDescription: 'Premium leather bag in hand-finished bridle hide, built on a hand-stitched frame.',
  },
  {
    name: 'Voyager Canvas Travel Bag',
    brand: 'KNB Voyage', category: 'travel', price: 189, salePrice: null, stock: 29,
    status: 'Published', file: 'meridian-travel-pack', focusKeyword: 'canvas travel bag', daysAgo: 21,
    shortDescription: 'Canvas travel bag with leather-capped corners and a full-length ventilated shoe compartment.',
  },
  {
    name: 'Onyx Lightweight Backpack',
    brand: 'KNB Field', category: 'backpack', price: 149, salePrice: 119, stock: 33,
    status: 'Published', file: 'onyx-featherpack', focusKeyword: 'lightweight backpack', daysAgo: 22,
    shortDescription: 'A 620-gram lightweight backpack in ripstop nylon that folds into its own lid pocket.',
  },
  {
    name: 'Quantum 15-inch Laptop Backpack',
    brand: 'KNB Executive', category: 'laptop', price: 189, salePrice: null, stock: 25,
    status: 'Published', file: 'quantum-pack-15', focusKeyword: 'laptop backpack', daysAgo: 23,
    shortDescription: 'Commuter laptop backpack with a suspended 15-inch bay and a side-entry tech pocket.',
  },
  {
    name: 'Aero Shell Suitcase',
    brand: 'KNB Voyage', category: 'travel', price: 429, salePrice: 379, stock: 0,
    status: 'Published', file: 'aero-shell-suitcase', focusKeyword: 'suitcase', daysAgo: 24,
    shortDescription: 'Check-in suitcase in recycled polycarbonate, tested to five thousand wheel kilometres.',
  },
  {
    name: 'Amber Woven Satchel',
    brand: 'KNB Atelier', category: 'women', price: 249, salePrice: null, stock: 13,
    status: 'Published', file: 'amber-woven-satchel', focusKeyword: 'woven satchel', daysAgo: 25,
    shortDescription: 'Hand-woven satchel in amber calf leather with a turn-lock closure and a suede lining.',
  },
  {
    name: 'Aria Bucket Bag',
    brand: 'KNB Atelier', category: 'women', price: 209, salePrice: 179, stock: 17,
    status: 'Published', file: 'aria-bucket-bag', focusKeyword: 'bucket bag', daysAgo: 26,
    shortDescription: 'Drawstring bucket bag in soft nappa with an interior zip pouch on a leather leash.',
  },
  {
    name: 'Blush Chain Clutch',
    brand: 'KNB Atelier', category: 'women', price: 159, salePrice: null, stock: 21,
    status: 'Draft', file: 'blush-chain-clutch', focusKeyword: 'clutch', daysAgo: 27,
    shortDescription: 'Evening clutch with a removable chain, sized for a phone, a card case and a lipstick.',
  },
  {
    name: 'Crimson Top Handle Bag',
    brand: 'KNB Atelier', category: 'women', price: 289, salePrice: 239, stock: 6,
    status: 'Draft', file: 'crimson-top-handle', focusKeyword: 'top handle bag', daysAgo: 28,
    shortDescription: 'Top handle bag in crimson box calf, structured so that it stands unaided when set down.',
  },
  {
    name: 'Helios Roll Top Backpack',
    brand: 'KNB Field', category: 'backpack', price: 199, salePrice: null, stock: 19,
    status: 'Draft', file: 'helios-roll-top', focusKeyword: 'roll top backpack', daysAgo: 29,
    shortDescription: 'Roll top backpack that expands from 22 to 30 litres, with welded waterproof seams.',
  },
  {
    name: 'Navy City Backpack',
    brand: 'KNB Field', category: 'backpack', price: 139, salePrice: 109, stock: 0,
    status: 'Archived', file: 'navy-city-backpack', focusKeyword: 'city backpack', daysAgo: 30,
    shortDescription: 'Everyday city backpack in navy ripstop with a fleece-lined sunglasses pocket.',
  },
  {
    name: 'Pearl Flap Bag',
    brand: 'KNB Atelier', category: 'women', price: 319, salePrice: null, stock: 3,
    status: 'Archived', file: 'pearl-flap-bag', focusKeyword: 'flap bag', daysAgo: 31,
    shortDescription: 'Quilted flap bag in pearl lambskin on a slim chain strap, from the retired Pearl line.',
  },
]

// ---------------------------------------------------------------------------
// Row builders
//
// The SEO helpers are injected rather than imported: lib/admin/seo.js is an ES
// module and these scripts are CommonJS, so the caller dynamic-imports it once
// and passes it down. Reusing the real validator means a seeded product's SEO
// score is computed exactly as lib/actions/products.js computes it on save.
// ---------------------------------------------------------------------------

const daysBefore = (now, days) => new Date(now - days * 86_400_000).toISOString()

function stockStatusFor(stock) {
  if (stock === 0) return 'Out of stock'
  if (stock <= LOW_STOCK_ALERT) return 'Low stock'
  return 'In stock'
}

function toUserRow(user, id, now) {
  return {
    id,
    full_name: user.name,
    email: user.email,
    phone: user.phone,
    avatar_url: user.avatarUrl,
    status: user.status,
    created_at: daysBefore(now, user.daysAgo),
  }
}

function toProductRow(product, index, seo, now) {
  const slug = seo.slugify(product.name)
  const featuredImage = image(product.file)
  const title = `${product.name} | Knock Nation Bag`

  // Archived products are deliberately noindex: a retired line should not keep
  // competing with the live catalogue in search results.
  const robots = product.status === 'Archived' ? 'noindex, follow' : 'index, follow'

  const seoFields = {
    title,
    description: product.shortDescription,
    slug,
    keywords: [product.focusKeyword, product.category, product.brand, 'knock nation bag'].join(', '),
    focusKeyword: product.focusKeyword,
    canonical: seo.autoCanonical(slug),
    robots,
    index: !robots.startsWith('noindex'),
    follow: !robots.includes('nofollow'),
    ogTitle: product.name,
    ogDescription: product.shortDescription,
    ogImage: featuredImage,
    twitterTitle: product.name,
    twitterDescription: product.shortDescription,
    twitterImage: featuredImage,
    altText: product.name,
    schemaType: 'Product',
  }

  return {
    name: product.name,
    slug,
    sku: `KNB-${CATEGORY_SKU[product.category]}-${1000 + index + 1}`,
    brand: product.brand,
    category: product.category,
    short_description: product.shortDescription,
    price: product.price,
    sale_price: product.salePrice,
    stock: product.stock,
    stock_status: stockStatusFor(product.stock),
    low_stock_alert: LOW_STOCK_ALERT,
    featured_image: featuredImage,
    seo_title: title,
    meta_description: product.shortDescription,
    meta_keywords: seoFields.keywords,
    canonical_url: seoFields.canonical,
    meta_robots: robots,
    focus_keyword: product.focusKeyword,
    og_title: seoFields.ogTitle,
    og_description: seoFields.ogDescription,
    og_image: featuredImage,
    twitter_title: seoFields.twitterTitle,
    twitter_description: seoFields.twitterDescription,
    twitter_image: featuredImage,
    seo_score: seo.seoScore(seo.validateSeo(seoFields)),
    status: product.status,
    created_at: daysBefore(now, product.daysAgo),
  }
}

module.exports = { users, products, toUserRow, toProductRow }
