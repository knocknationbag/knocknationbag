import { notFound } from 'next/navigation'
import { CircleCheck, Clock } from 'lucide-react'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import OrderDetails from '@/components/orders/OrderDetails'
import { getOrderByToken } from '@/lib/db/orders'
import { getAccount } from '@/lib/auth/account'

export const metadata = {
  title: 'Order Confirmation',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Where checkout lands. The URL carries the order's unguessable access token,
 * so a guest can reopen it later (bookmark it) without an account, and nobody
 * can browse other people's orders by changing a number.
 */
export default async function OrderConfirmationPage({ params }) {
  const { token } = await params
  const [order, account] = await Promise.all([getOrderByToken(token), getAccount()])
  if (!order) notFound()

  const signedIn = account.status !== 'guest'
  const unpaid = order.awaitingOnlinePayment

  return (
    <Container className="py-10 md:py-14 xl:py-16">
      <div className="max-w-[720px]">
        <span className={`grid size-14 place-items-center rounded-full ${unpaid ? 'bg-gold/15' : 'bg-verified-bg'}`}>
          {unpaid
            ? <Clock size={28} className="text-ink" aria-hidden="true" />
            : <CircleCheck size={28} className="text-verified-fg" aria-hidden="true" />}
        </span>
        <p className="mt-5 font-mono text-eyebrow uppercase text-gold">Order {order.number}</p>
        <h1 className="mt-3 text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">
          {unpaid ? 'Payment not completed' : `Thank you, ${order.customerName.split(' ')[0]}!`}
        </h1>
        <p className="mt-4 text-lead text-body">
          {unpaid
            ? 'Your order is saved but has not been paid, so we have not reserved the items yet. Pay below to confirm it.'
            : 'Your order has been placed. Keep this page — you can come back to it any time to check the status.'}
          {signedIn ? ' It is also saved in your account.' : ''}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/shop" variant="primary" size="md">Continue shopping</Button>
          {signedIn ? <Button href="/account" variant="secondary" size="md">View my orders</Button> : null}
        </div>
      </div>

      <div className="mt-12">
        <OrderDetails order={order} />
      </div>
    </Container>
  )
}
