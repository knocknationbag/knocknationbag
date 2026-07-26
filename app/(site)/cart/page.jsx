import { ShoppingBag } from 'lucide-react'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import PageHeader from '@/components/common/PageHeader'
import SectionHeader from '@/components/common/SectionHeader'
import CartLineItem from '@/components/common/CartLineItem'
import OrderSummary from '@/components/common/OrderSummary'
import EmptyState from '@/components/ui/EmptyState'
import ProductGrid from '@/components/product/ProductGrid'
import { cartItems } from '@/data/account'
import { getBestSellers } from '@/data/products'

export const metadata = {
  title: 'Shopping Cart',
  description: 'Review the pieces in your cart before checkout.',
  robots: { index: false, follow: true },
}

export default function CartPage() {
  const items = cartItems
  const recommended = getBestSellers(4)

  return (
    <>
      <PageHeader
        eyebrow="ALMOST YOURS"
        title="Shopping Cart"
        description={items.length ? `${items.length} ${items.length === 1 ? 'line' : 'lines'} in your cart.` : undefined}
        breadcrumbs={[{ label: 'Cart' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Nothing here yet. Browse the range and add a piece — your cart is kept for 30 days."
            actionLabel="Shop all bags"
            actionHref="/shop"
            secondaryLabel="View best sellers"
            secondaryHref="/collections/best-sellers"
          />
        ) : (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
            <section aria-labelledby="cart-items">
              <h2 id="cart-items" className="sr-only">Items in your cart</h2>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <CartLineItem key={item.slug} item={item} />
                ))}
              </ul>
            </section>

            <OrderSummary items={items} ctaLabel="Proceed to checkout" ctaHref="/checkout" className="h-fit" />
          </div>
        )}
      </Container>

      {recommended.length ? (
        <Section background="muted">
          <SectionHeader eyebrow="OFTEN BOUGHT TOGETHER" title="Recommended for You" />
          <ProductGrid products={recommended} columns={4} />
        </Section>
      ) : null}
    </>
  )
}
