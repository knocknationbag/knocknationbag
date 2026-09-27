import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listReturns } from '@/lib/db/returns'
import { friendlyDbError } from '@/lib/db/errors'
import { RETURN_REASONS, RETURN_STATUSES } from '@/constants/returns'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Returns' }

const PAGE_SIZE = 20

/** Return requests, newest first. Open one to review, receive, inspect and refund. */
export default async function AdminReturnsPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)
  const { rows, total, error, setupRequired } = await listReturns({
    query: params?.q ?? '',
    status: params?.status ?? '',
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <AdminPageHeader
        title="Returns"
        description="Customer return requests. Refunds are started here only after the product is received and passes inspection."
      />
      <ServerListModule
        rows={rows.map((r) => ({
          ...r,
          name: r.number,
          orderNumber: r.order?.number ?? '—',
          customer: r.order?.customerName ?? '—',
          units: r.items.reduce((sum, item) => sum + item.quantity, 0),
          reasonLabel: RETURN_REASONS[r.reason] ?? r.reason,
          requested: formatAdminDate(r.requestedAt),
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search return number…"
        filters={[{ name: 'status', label: 'Status', options: RETURN_STATUSES }]}
        emptyTitle="No return requests"
        emptyDescription="Customers can request a return within 7 days of delivery from their order page."
        columns={[
          { key: 'name', header: 'Return', type: 'title', hrefBase: '/admin/returns', linkKey: 'id', width: '14%' },
          { key: 'orderNumber', header: 'Order', type: 'mono' },
          { key: 'customer', header: 'Customer', type: 'strong' },
          { key: 'units', header: 'Units', type: 'number', align: 'right' },
          { key: 'reasonLabel', header: 'Reason' },
          { key: 'requested', header: 'Requested' },
          { key: 'status', header: 'Status', type: 'status' },
        ]}
      />
    </>
  )
}
