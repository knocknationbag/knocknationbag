/**
 * Media Library records.
 *
 * The single source of image metadata for the whole dashboard. Products,
 * categories, brands, collections, CMS, blog and SEO all select from here
 * rather than typing paths, so alt text and usage tracking exist in one place.
 *
 * `usedIn` is what makes deletion safe: it records every place a file is
 * referenced, so the delete dialog can warn before breaking a live page.
 * When Supabase Storage lands, only the source of this array changes.
 */

import { products } from '@/data/products'
import { categories } from '@/data/categories'
import { instagramPosts } from '@/data/instagram'

let seq = 0
const id = () => `m${(seq += 1).toString().padStart(3, '0')}`

/** Deterministic pseudo-size so the list has believable variety without Math.random. */
const sizeFor = (i, base) => base + ((i * 7919) % 60) * 1024

function record({ src, folder, width, height, bytes, alt = '', title = '', caption = '', description = '', uploaded, usedIn = [] }) {
  const filename = src.split('/').pop()
  return {
    id: id(),
    filename,
    src,
    path: src,
    url: `https://knocknationbag.com${src}`,
    folder,
    type: filename.split('.').pop().toUpperCase(),
    width,
    height,
    bytes,
    alt,
    title,
    caption,
    description,
    uploaded,
    usedIn,
    optimised: true,
  }
}

const productMedia = products.map((p, i) =>
  record({
    src: p.image,
    folder: 'products',
    width: i < 11 ? 390 : 868,
    height: i < 11 ? 280 : 360,
    bytes: sizeFor(i, 96 * 1024),
    alt: p.imageAlt,
    title: p.title,
    uploaded: `${(i % 27) + 1} Jan 2025`,
    usedIn: [
      { module: 'Products', label: p.title, href: `/admin/products/${p.slug}` },
      ...(p.collections.includes('featured')
        ? [{ module: 'Homepage', label: 'Featured Collection', href: '/admin/pages' }]
        : []),
    ],
  }),
)

const categoryMedia = categories.map((c, i) =>
  record({
    src: c.image,
    folder: 'categories',
    width: 1100,
    height: 425,
    bytes: sizeFor(i, 18 * 1024),
    alt: c.imageAlt,
    title: `${c.title} category`,
    uploaded: `${(i % 20) + 1} Jan 2025`,
    usedIn: [
      { module: 'Categories', label: c.title, href: '/admin/categories' },
      { module: 'Homepage', label: 'Shop by Category', href: '/admin/pages' },
    ],
  }),
)

const lifestyleMedia = instagramPosts.map((post, i) =>
  record({
    src: post.image,
    folder: 'lifestyle',
    width: 300,
    height: 220,
    bytes: sizeFor(i, 12 * 1024),
    alt: post.imageAlt,
    uploaded: `${(i % 14) + 1} Feb 2025`,
    usedIn: [{ module: 'Homepage', label: 'Instagram strip', href: '/admin/pages' }],
  }),
)

/** Deliberately includes unused files and files with no alt text — both are real
 *  library problems the UI needs to surface. */
const otherMedia = [
  record({
    src: '/images/hero/hero-desktop.webp', folder: 'hero', width: 680, height: 520, bytes: 8_400,
    alt: 'Black leather backpack and duffle bag arranged on a stone plinth',
    title: 'Homepage hero', uploaded: '2 Jan 2025',
    usedIn: [
      { module: 'Homepage', label: 'Hero section', href: '/admin/pages' },
      { module: 'Admin', label: 'Sign-in panel', href: '/admin/login' },
    ],
  }),
  record({
    src: '/images/hero/hero-tablet.webp', folder: 'hero', width: 420, height: 340, bytes: 5_200,
    alt: '', uploaded: '2 Jan 2025', usedIn: [],
  }),
  record({
    src: '/images/banners/promo-crafted.webp', folder: 'banners', width: 1920, height: 480, bytes: 51_600,
    alt: 'Traveller carrying a tan leather duffle along a tree-lined boulevard',
    title: 'Crafted for Those Who Move', uploaded: '5 Jan 2025',
    usedIn: [
      { module: 'Homepage', label: 'Promotional banner', href: '/admin/pages' },
      { module: 'Banners', label: 'Homepage promo', href: '/admin/banners' },
    ],
  }),
  record({
    src: '/images/banners/promo-crafted-alt.webp', folder: 'banners', width: 1024, height: 360, bytes: 30_100,
    alt: '', uploaded: '5 Jan 2025', usedIn: [],
  }),
  record({
    src: '/images/about/founder-portrait.webp', folder: 'about', width: 1000, height: 1500, bytes: 179_800,
    alt: 'Rafael Duarte, Founder and Creative Director, photographed against a neutral studio backdrop',
    title: 'Founder portrait', caption: 'Rafael Duarte, Founder & Creative Director',
    uploaded: '26 Jan 2025',
    usedIn: [{ module: 'CMS', label: 'About Us', href: '/admin/pages' }],
  }),
  record({
    src: '/images/lifestyle/ig-07-teal-tote-street.webp', folder: 'lifestyle', width: 900, height: 600, bytes: 59_400,
    alt: '', uploaded: '9 Feb 2025', usedIn: [],
  }),
  record({
    // The file here is a plain t-shirt mockup, not the bag its name implies —
    // an off-brand asset that slipped in during sourcing. Alt text describes
    // what the file actually shows; the asset itself still wants replacing.
    src: '/images/lifestyle/ig-08-stairwell-noir.webp', folder: 'lifestyle', width: 900, height: 900, bytes: 30_700,
    alt: 'Plain white t-shirt worn against a blurred plant-filled interior',
    uploaded: '9 Feb 2025',
    usedIn: [],
  }),
  record({
    src: '/images/lifestyle/ig-09-travel-flatlay.webp', folder: 'lifestyle', width: 900, height: 600, bytes: 26_600,
    alt: '', uploaded: '9 Feb 2025', usedIn: [],
  }),
  record({
    src: '/logo/kn-monogram.svg', folder: 'brand', width: 38, height: 38, bytes: 1_288,
    alt: 'Knock Nation Bag monogram', title: 'Primary monogram', uploaded: '1 Jan 2025',
    usedIn: [{ module: 'Brand', label: 'Header logo', href: '/admin/settings' }],
  }),
  record({
    src: '/logo/kn-monogram-white.svg', folder: 'brand', width: 38, height: 38, bytes: 1_288,
    alt: 'Knock Nation Bag monogram, reversed', title: 'Reverse monogram', uploaded: '1 Jan 2025',
    usedIn: [{ module: 'Brand', label: 'Footer logo', href: '/admin/settings' }],
  }),
  record({
    src: '/logo/kn-monogram-mono.svg', folder: 'brand', width: 38, height: 38, bytes: 1_288,
    alt: '', uploaded: '1 Jan 2025', usedIn: [],
  }),
]

/**
 * One record per file, keyed on path.
 *
 * Several products share a photograph, and a media library must show that file
 * once with every reference merged into `usedIn` — otherwise the same image
 * appears as several rows and the delete dialog under-reports what it will
 * break. Dedupe keeps the richest metadata across the duplicates.
 */
function dedupeBySrc(records) {
  const bySrc = new Map()

  records.forEach((record) => {
    const existing = bySrc.get(record.src)
    if (!existing) {
      bySrc.set(record.src, record)
      return
    }
    bySrc.set(record.src, {
      ...existing,
      alt: existing.alt || record.alt,
      title: existing.title || record.title,
      caption: existing.caption || record.caption,
      description: existing.description || record.description,
      usedIn: [
        ...existing.usedIn,
        ...record.usedIn.filter(
          (use) => !existing.usedIn.some((u) => u.module === use.module && u.label === use.label),
        ),
      ],
    })
  })

  return [...bySrc.values()]
}

export const mediaItems = dedupeBySrc([
  ...productMedia,
  ...categoryMedia,
  ...lifestyleMedia,
  ...otherMedia,
])

export const MEDIA_FOLDERS = ['products', 'categories', 'lifestyle', 'banners', 'hero', 'about', 'brand']

export const MEDIA_TYPES = [...new Set(mediaItems.map((m) => m.type))].sort()
