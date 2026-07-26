import { CheckCircle2, Mail, Package, Truck } from 'lucide-react'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import CartLineItem from '@/components/common/CartLineItem'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import { cartItems } from '@/data/account'
import { getBestSellers } from '@/data/products'
import { formatPrice } from '@/utils/formatPrice'

export const metadata = {
  title: 'Order Confirmed',
  description: 'Your Knock Nation Bag order has been received.',
  robots: { index: false, follow: false },
}

const NEXT_STEPS = [
  { icon: Mail, title: 'Confirmation sent', body: 'A receipt is on its way to your inbox with the full order breakdown.' },
  { icon: Package, title: 'Packed within 24h', body: 'Orders placed before 2pm on a working day are despatched the same day.' },
  { icon: Truck, title: 'Tracked all the way', body: 'You will get a tracking link the moment the parcel leaves the workshop.' },
]

export default function OrderSuccessPage() {
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const total = subtotal + Math.round(subtotal * 0.08)

  return (
    <>
      <Container className="py-14 text-center md:py-20 xl:py-24">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-verified-bg">
          <CheckCircle2 size={30} strokeWidth={2} className="text-verified-fg" aria-hidden="true" />
        </span>

        <p className="mt-6 font-mono text-eyebrow uppercase text-gold">Order confirmed</p>
        <h1 className="mt-3 text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">
          Thank you — your order is in.
        </h1>
        <p className="mx-auto mt-4 max-w-[54ch] text-lead text-body">
          Order <strong className="font-semibold text-ink">KNB-25148</strong> was placed successfully.
          We have emailed a confirmation and will be in touch the moment it ships.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/account" variant="primary" size="lg">Track your order</Button>
          <Button href="/shop" variant="secondary" size="lg">Continue shopping</Button>
        </div>
      </Container>

      <Container className="pb-14 xl:pb-20">
        <div className="mx-auto max-w-[760px] rounded-card border border-border bg-surface-muted p-6 xl:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-5">
            <h2 className="text-[18px] font-bold text-ink">Order summary</h2>
            <p className="text-[15px] text-body">
              Total paid <strong className="text-[18px] font-bold text-ink">{formatPrice(total)}</strong>
            </p>
          </div>

          <ul className="divide-y divide-border">
            {cartItems.map((item) => (
              <CartLineItem key={item.slug} item={item} readOnly />
            ))}
          </ul>
        </div>

        <ul className="mx-auto mt-8 grid max-w-[760px] gap-3 md:grid-cols-3 md:gap-4">
          {NEXT_STEPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-card border border-border bg-surface p-5">
              <Icon size={20} strokeWidth={2} className="text-gold" aria-hidden="true" />
              <h3 className="mt-3 text-[15px] font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-[21px] text-body">{body}</p>
            </li>
          ))}
        </ul>
      </Container>

      <Section background="muted">
        <SectionHeader eyebrow="COMPLETE THE SYSTEM" title="You May Also Like" />
        <ProductGrid products={getBestSellers(4)} columns={4} />
      </Section>
    </>
  )
}
