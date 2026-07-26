import Link from 'next/link'
import { CreditCard, RefreshCw, TriangleAlert } from 'lucide-react'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Payment Unsuccessful',
  description: 'We could not complete your payment.',
  robots: { index: false, follow: false },
}

const REASONS = [
  { icon: CreditCard, title: 'Card declined', body: 'Your bank may have blocked the transaction. Most cards clear on a second attempt or with a different card.' },
  { icon: RefreshCw, title: 'Session expired', body: 'Payment sessions expire after 15 minutes for security. Returning to the cart starts a fresh one.' },
  { icon: TriangleAlert, title: 'Details mismatch', body: 'Check that the billing address matches the one registered to the card exactly.' },
]

export default function OrderFailedPage() {
  return (
    <Container className="py-14 md:py-20 xl:py-24">
      <div className="mx-auto max-w-[720px] text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-danger/10">
          <TriangleAlert size={30} strokeWidth={2} className="text-danger" aria-hidden="true" />
        </span>

        <p className="mt-6 font-mono text-eyebrow uppercase text-gold">Payment unsuccessful</p>
        <h1 className="mt-3 text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">
          We could not take that payment
        </h1>
        <p className="mx-auto mt-4 max-w-[54ch] text-lead text-body">
          Nothing has been charged and your cart is untouched. Below are the three reasons this
          usually happens.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/checkout" variant="primary" size="lg">Try again</Button>
          <Button href="/cart" variant="secondary" size="lg">Back to cart</Button>
        </div>
      </div>

      <ul className="mx-auto mt-12 grid max-w-[860px] gap-3 md:grid-cols-3 md:gap-4">
        {REASONS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-card border border-border bg-surface p-6">
            <Icon size={20} strokeWidth={2} className="text-gold" aria-hidden="true" />
            <h2 className="mt-3 text-[15px] font-bold text-ink">{title}</h2>
            <p className="mt-1.5 text-[14px] leading-[21px] text-body">{body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-[15px] text-body">
        Still stuck?{' '}
        <Link href="/contact" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
          Contact customer care
        </Link>{' '}
        and we will place the order for you.
      </p>
    </Container>
  )
}
