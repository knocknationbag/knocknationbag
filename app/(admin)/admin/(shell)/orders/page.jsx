import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listOrders } from '@/lib/db/orders'
import { friendlyDbError } from '@/lib/db/errors'
import { ORDER_STATUSES, PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Orders' }

const PAGE_SIZE = 20

/** Newest first. Orders are never deleted — cancel instead, so the record stays. */
export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)
  const paymentFilter = Object.entries(PAYMENT_STATUS_LABELS).find(([, label]) => label === params?.payment)?.[0] ?? ''

  const { rows, total, error, setupRequired } = await listOrders({
    query: params?.q ?? '',
    status: params?.status ?? '',
    payment: paymentFilter,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <AdminPageHeader title="Orders" description="Every order placed on the website. Open one to update its status or add tracking." />

      <ServerListModule
        rows={rows.map((o) => ({
          ...o,
          name: o.number,
          customer: o.customerName,
          placed: formatAdminDate(o.createdAt),
          payment: PAYMENT_STATUS_LABELS[o.paymentStatus],
          items: o.itemCount,
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search order no., name, email or phone…"
        filters={[
          { name: 'status', label: 'Status', options: ORDER_STATUSES },
          { name: 'payment', label: 'Payment', options: Object.values(PAYMENT_STATUS_LABELS) },
        ]}
        emptyTitle="No orders yet"
        emptyDescription="Orders appear here the moment a customer places one."
        columns={[
          { key: 'name', header: 'Order', type: 'title', hrefBase: '/admin/orders', linkKey: 'id', width: '14%' },
          { key: 'customer', header: 'Customer', type: 'strong' },
          { key: 'placed', header: 'Placed' },
          { key: 'items', header: 'Items', type: 'number', align: 'right' },
          { key: 'total', header: 'Total', type: 'money', align: 'right' },
          { key: 'payment', header: 'Payment', type: 'status' },
          { key: 'status', header: 'Status', type: 'status' },
          { key: 'actions', header: '', type: 'actions', align: 'right', label: 'order', viewHrefBase: '/admin/orders', linkKey: 'id' },
        ]}
      />
    </>
  )
}
