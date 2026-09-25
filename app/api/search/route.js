import { NextResponse } from 'next/server'

import { getCatalog, getCategoryTree, PLACEHOLDER_IMAGE } from '@/lib/catalog'
import { searchProducts } from '@/utils/catalog'

/**
 * Live suggestions for the header search overlay.
 *
 * Reads the cached public catalogue (no session), so it only ever returns
 * Published products and Active categories — the same data any visitor can
 * see on the site. With no query it returns categories as quick links.
 */
export async function GET(request) {
  const query = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 80)

  if (!query) {
    const tree = await getCategoryTree()
    return NextResponse.json({
      categories: tree.filter((c) => c.productCount > 0).slice(0, 8).map((c) => ({ slug: c.slug, title: c.title })),
      products: [],
    })
  }

  const { products } = await getCatalog()
  const results = searchProducts(products, query).slice(0, 6).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.categoryName ?? p.brand ?? '',
    price: p.price,
    image: p.image ?? PLACEHOLDER_IMAGE,
  }))

  return NextResponse.json({ categories: [], products: results })
}
