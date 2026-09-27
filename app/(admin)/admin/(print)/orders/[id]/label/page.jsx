import { notFound } from 'next/navigation'

import ShippingLabel from '@/components/orders/ShippingLabel'
import PrintToolbar from '@/components/orders/PrintToolbar'
import { requirePermission } from '@/lib/auth/session'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { getOrder } from '@/lib/db/orders'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Print shipping label' }

/** 3 × 5 inch label. In the print dialog choose the label printer / 3×5 paper, scale 100%. */
export default async function AdminLabelPage({ params }) {
  const { id } = await params
  await requirePermission(PERMISSIONS.ORDERS_VIEW, `/admin/orders/${id}/label`)
  const { order } = await getOrder(id)
  if (!order) notFound()

  return (
    <>
      <PrintToolbar
        backHref={`/admin/orders/${order.id}`}
        backLabel={`Order ${order.number}`}
        record={{ orderId: order.id, kind: 'label' }}
        printCount={order.labelPrintCount}
        lastPrinted={order.labelPrintedAt ? formatAdminDate(order.labelPrintedAt) : null}
        className="max-w-[480px]"
      />
      <ShippingLabel order={order} />
      <p className="mx-auto mt-4 max-w-[3in] text-admin-xs text-muted print:hidden">
        Print at 100% scale on 3 × 5 in label stock (portrait). In Chrome, choose the label printer and paper size 3 × 5 in if it is not picked automatically.
      </p>
    </>
  )
}
