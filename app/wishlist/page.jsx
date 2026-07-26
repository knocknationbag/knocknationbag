import { Heart } from 'lucide-react'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import ProductGrid from '@/components/product/ProductGrid'
import EmptyState from '@/components/ui/EmptyState'
import { products } from '@/data/products'
import { wishlistSlugs } from '@/data/account'

export const metadata = {
  title: 'Wishlist',
  description: 'Pieces you have saved for later.',
  robots: { index: false, follow: true },
}

export default function WishlistPage() {
  const items = wishlistSlugs.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean)

  return (
    <>
      <PageHeader
        eyebrow="SAVED FOR LATER"
        title="Wishlist"
        description={
          items.length
            ? `${items.length} ${items.length === 1 ? 'piece' : 'pieces'} saved. Wishlists are kept for 12 months.`
            : undefined
        }
        breadcrumbs={[{ label: 'Wishlist' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        {items.length ? (
          <ProductGrid products={items} columns={4} priorityCount={4} />
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here. Wishlists are kept for 12 months and sync across devices once you sign in."
            actionLabel="Shop all bags"
            actionHref="/shop"
            secondaryLabel="Browse collections"
            secondaryHref="/collections"
          />
        )}
      </Container>
    </>
  )
}
