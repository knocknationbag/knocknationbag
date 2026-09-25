import JsonLd from '@/components/common/JsonLd'
import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import ProductSection from '@/components/home/ProductSection'
import FeatureSection from '@/components/home/FeatureSection'
import NewArrivalsSection from '@/components/home/NewArrivalsSection'
import PromoBanner from '@/components/home/PromoBanner'
import InstagramSection from '@/components/home/InstagramSection'
import NewsletterSection from '@/components/home/NewsletterSection'

import { getCatalog, getCategoryTree, PLACEHOLDER_IMAGE } from '@/lib/catalog'
import { sortProducts } from '@/utils/catalog'
import { features } from '@/data/features'
import { instagramPosts } from '@/data/instagram'
import { site } from '@/constants/site'

export const metadata = {
  title: 'Knock Nation Bag — Premium Bags for Work, Travel & Modern Life',
  description: site.description,
  alternates: { canonical: '/' },
}

const absolute = (src) => (src?.startsWith('http') ? src : `${site.url}${src}`)

/**
 * Home landing page. Server Component: it wires live catalogue data to the
 * sections and does nothing else (docs/architecture.md §9).
 *
 * A section with nothing to show is left out rather than rendered empty — a
 * new shop with no sale items simply has no Sale row.
 */
export default async function HomePage() {
  const [{ products }, tree] = await Promise.all([getCatalog(), getCategoryTree()])

  const withPhoto = (list) => list.filter((p) => p.image !== PLACEHOLDER_IMAGE)
  const featured = sortProducts(products.filter((p) => p.isFeatured), 'featured').slice(0, 8)
  const onSale = products.filter((p) => p.discount > 0).slice(0, 8)
  const newest = sortProducts(products, 'newest')
  const newFeatured = withPhoto(newest).slice(0, 2)
  const newArrivals = newest.filter((p) => !newFeatured.includes(p)).slice(0, 3)
  const categories = tree
    .filter((c) => c.productCount > 0)
    .slice(0, 8)
    .map(({ id, slug, title, image, imageAlt }) => ({ id, slug, title, image, imageAlt }))

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Collection',
    itemListElement: featured.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: absolute(product.image),
        url: `${site.url}/product/${product.slug}`,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      },
    })),
  }

  return (
    <>
      {featured.length ? <JsonLd data={itemList} /> : null}

      <HeroSection />
      {categories.length ? <CategorySection categories={categories} /> : null}

      {featured.length ? (
        <ProductSection eyebrow="ELEGANCE REFINED" title="Featured Collection" products={featured} background="muted" />
      ) : null}

      <FeatureSection features={features} />

      {onSale.length ? (
        <ProductSection eyebrow="LIMITED REDUCTION" title="On Sale Now" products={onSale} background="surface" />
      ) : null}

      {newest.length ? <NewArrivalsSection featured={newFeatured} products={newArrivals} /> : null}
      <PromoBanner />
      <InstagramSection posts={instagramPosts} />
      <NewsletterSection />
    </>
  )
}
