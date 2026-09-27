import { notFound } from 'next/navigation'

import OrderInvoice from '@/components/orders/OrderInvoice'
import PrintToolbar from '@/components/orders/PrintToolbar'
import { requirePermission } from '@/lib/auth/session'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getOrder } from '@/lib/db/orders'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Print bill' }

export default async function AdminInvoicePage({ params }) {
  const { id } = await params
  await requirePermission(PERMISSIONS.ORDERS_VIEW, `/admin/orders/${id}/invoice`)
  const { order } = await getOrder(id)
  if (!order) notFound()

  return (
    <>
      <PrintToolbar
        backHref={`/admin/orders/${order.id}`}
        backLabel={`Order ${order.number}`}
        record={{ orderId: order.id, kind: 'invoice' }}
        printCount={order.invoicePrintCount}
        lastPrinted={order.invoicePrintedAt ? formatAdminDate(order.invoicePrintedAt) : null}
      />
      <OrderInvoice order={order} />
    </>
  )
}
