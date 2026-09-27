import { notFound } from 'next/navigation'

import OrderInvoice from '@/components/orders/OrderInvoice'
import PrintToolbar from '@/components/orders/PrintToolbar'
import { getOrderByToken } from '@/lib/db/orders'

export const metadata = { title: 'Bill' }
export const dynamic = 'force-dynamic'

/**
 * The customer's bill. Reached by the order's unguessable access token — the
 * same key as the order page — so a guest can open it without an account and
 * nobody can read another customer's bill by changing a number. Offered once
 * the order is confirmed (COD placed, or paid online).
 */
export default async function CustomerInvoicePage({ params }) {
  const { token } = await params
  const order = await getOrderByToken(token)
  if (!order || !order.hasBill) notFound()

  return (
    <>
      <PrintToolbar backHref={`/order/${order.accessToken}`} backLabel="Back to order" />
      <OrderInvoice order={order} />
    </>
  )
}
