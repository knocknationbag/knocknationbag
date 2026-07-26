import { products } from '@/data/products'
import { categories } from '@/data/categories'
import { collections } from '@/data/catalog'
import { policySlugs } from '@/data/content'
import { site } from '@/constants/site'

/**
 * XML sitemap at /sitemap.xml. Excludes cart, checkout, account, auth and
 * search — those are noindex (docs/seo.md §7).
 */
export default function sitemap() {
  const now = new Date('2025-01-15')

  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
    { path: '/categories', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/collections', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/sitemap', priority: 0.3, changeFrequency: 'monthly' },
  ]

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...categories.map((category) => ({
      url: `${site.url}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...collections.map((collection) => ({
      url: `${site.url}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${site.url}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...policySlugs.map((slug) => ({
      url: `${site.url}/${slug}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    })),
  ]
}
