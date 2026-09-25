import 'server-only'

import { getCatalog, getCategoryTree, PLACEHOLDER_IMAGE } from './index'

/**
 * The header's Shop mega menu, from live categories.
 *
 * MegaMenu lays out three link columns and a feature tile. Categories fill the
 * first two columns (split evenly, in the owner's display order); the third is
 * fixed browse links; the tile shows the newest product. Returns null when
 * there are no categories, and the Shop link then renders as a plain link.
 */
export async function getShopMenu() {
  const [tree, { products }] = await Promise.all([getCategoryTree(), getCatalog()])
  if (!tree.length) return null

  const links = tree.map((category) => ({ label: category.title, href: `/category/${category.slug}` }))
  const half = Math.ceil(links.length / 2)
  const newest = products.find((p) => p.image !== PLACEHOLDER_IMAGE)

  return {
    columns: [
      { heading: 'Shop by category', links: links.slice(0, half) },
      { heading: 'More categories', links: links.slice(half) },
      {
        heading: 'Browse',
        links: [
          { label: 'All products', href: '/shop' },
          { label: 'All categories', href: '/categories' },
          { label: 'New arrivals', href: '/collections/new-arrivals' },
          { label: 'Sale', href: '/collections/sale' },
          { label: 'Search', href: '/search' },
        ],
      },
    ],
    feature: {
      href: '/collections/new-arrivals',
      image: newest?.image ?? PLACEHOLDER_IMAGE,
      imageAlt: newest?.imageAlt ?? '',
      eyebrow: 'JUST IN',
      title: 'New Arrivals',
    },
  }
}
