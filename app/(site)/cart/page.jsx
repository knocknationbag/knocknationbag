import { ShoppingBag } from 'lucide-react'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import PageHeader from '@/components/common/PageHeader'
import SectionHeader from '@/components/common/SectionHeader'
import CartLineItem from '@/components/common/CartLineItem'
import OrderSummary from '@/components/common/OrderSummary'
import EmptyState from '@/components/ui/EmptyState'
import AuthNotice from '@/components/auth/AuthNotice'
import ProductGrid from '@/components/product/ProductGrid'
import { loadCart } from '@/lib/cart'
import { getCatalog } from '@/lib/catalog'
import { sortProducts } from '@/utils/catalog'

export const metadata = {
  title: 'Shopping Cart',
  description: 'Review the bags in your cart before checkout.',
  robots: { index: false, follow: true },
}

// Per-visitor: reads the cart cookie.
export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const [cart, { products }] = await Promise.all([loadCart(), getCatalog()])
  const inCart = new Set(cart.lines.map((line) => line.productId))
  const recommended = sortProducts(products.filter((p) => p.inStock && !inCart.has(p.id)), 'featured').slice(0, 4)
  const hasProblem = cart.lines.some((line) => line.problem)

  return (
    <>
      <PageHeader
        eyebrow="ALMOST YOURS"
        title="Shopping Cart"
        description={cart.lines.length ? `${cart.totals.itemCount} item${cart.totals.itemCount === 1 ? '' : 's'} in your cart.` : undefined}
        breadcrumbs={[{ label: 'Cart' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        {cart.loadError ? (
          <AuthNotice tone="error">We could not load your cart just now. Please refresh the page in a moment.</AuthNotice>
        ) : cart.lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse the range and add a bag — your cart is saved on this device."
            actionLabel="Shop all bags"
            actionHref="/shop"
            secondaryLabel="Browse categories"
            secondaryHref="/categories"
          />
        ) : (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
            <section aria-labelledby="cart-items">
              <h2 id="cart-items" className="sr-only">Items in your cart</h2>
              <ul className="divide-y divide-border">
                {cart.lines.map((line) => (
                  <CartLineItem key={line.id} line={line} />
                ))}
              </ul>
            </section>

            <OrderSummary
              totals={cart.totals}
              ctaLabel="Proceed to checkout"
              ctaHref="/checkout"
              ctaDisabled={!cart.canCheckout}
              className="h-fit"
            >
              {hasProblem ? (
                <p role="alert" className="mt-4 text-[14px] font-semibold text-danger">
                  Please fix the highlighted items before checking out.
                </p>
              ) : null}
            </OrderSummary>
          </div>
        )}
      </Container>

      {recommended.length ? (
        <Section background="muted">
          <SectionHeader eyebrow="YOU MIGHT ALSO LIKE" title="Recommended for You" />
          <ProductGrid products={recommended} columns={4} />
        </Section>
      ) : null}
    </>
  )
}
