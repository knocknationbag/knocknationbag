import { notFound, redirect } from 'next/navigation'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import OrderDetails from '@/components/orders/OrderDetails'
import { getMyOrder } from '@/lib/db/orders'
import { getAccount } from '@/lib/auth/account'
import { customerLoginUrlFor } from '@/lib/auth/customerRoutes'

export const metadata = { title: 'Order Details', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/** A signed-in customer's order. RLS returns it only to its owner. */
export default async function AccountOrderPage({ params }) {
  const { number } = await params
  const account = await getAccount()
  if (account.status === 'guest') redirect(customerLoginUrlFor(`/account/orders/${number}`))

  const order = await getMyOrder(number)
  if (!order) notFound()

  return (
    <>
      <PageHeader
        eyebrow="MY ORDERS"
        title={`Order ${order.number}`}
        breadcrumbs={[{ label: 'My Account', href: '/account' }, { label: order.number }]}
      />
      <Container className="py-10 md:py-14 xl:py-16">
        <OrderDetails order={order} />
      </Container>
    </>
  )
}
