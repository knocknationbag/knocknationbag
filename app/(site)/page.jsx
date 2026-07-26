import JsonLd from '@/components/common/JsonLd'
import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import ProductSection from '@/components/home/ProductSection'
import FeatureSection from '@/components/home/FeatureSection'
import NewArrivalsSection from '@/components/home/NewArrivalsSection'
import PromoBanner from '@/components/home/PromoBanner'
import ReviewSection from '@/components/home/ReviewSection'
import InstagramSection from '@/components/home/InstagramSection'
import NewsletterSection from '@/components/home/NewsletterSection'

import { getByCollection } from '@/data/products'
import { categories } from '@/data/categories'
import { features } from '@/data/features'
import { reviews } from '@/data/reviews'
import { instagramPosts } from '@/data/instagram'
import { site } from '@/constants/site'

export const metadata = {
  title: 'Knock Nation Bag — Premium Bags for Work, Travel & Modern Life',
  description: site.description,
  alternates: { canonical: '/' },
}

/**
 * Home landing page. Server Component: it wires data to sections and does
 * nothing else (docs/architecture.md §9). Sections never import from data/.
 */
export default function HomePage() {
  const featured = getByCollection('featured')
  const bestSellers = getByCollection('best-sellers')
  const newFeatured = getByCollection('new-featured')
  const newArrivals = getByCollection('new')

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
        image: `${site.url}${product.image}`,
        url: `${site.url}/product/${product.slug}`,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  }

  return (
    <>
      <JsonLd data={itemList} />

      <HeroSection />
      <CategorySection categories={categories} />

      <ProductSection
        eyebrow="ELEGANCE REFINED"
        title="Featured Collection"
        products={featured}
        background="muted"
      />

      <FeatureSection features={features} />

      <ProductSection
        eyebrow="ELITE FAVORITES"
        title="Best Sellers"
        products={bestSellers}
        background="surface"
      />

      <NewArrivalsSection featured={newFeatured} products={newArrivals} />
      <PromoBanner />
      <ReviewSection reviews={reviews} />
      <InstagramSection posts={instagramPosts} />
      <NewsletterSection />
    </>
  )
}
