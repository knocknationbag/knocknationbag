import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { recentOrders } from '@/data/admin'

export const metadata = { title: 'Orders' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Orders" description="Fulfilment queue and order history." />
      <ListModule
        rows={recentOrders}
        searchKeys={['id', 'customer', 'email']}
        searchPlaceholder="Search by order, customer or email…"
        filters={[{ name: 'status', label: 'Status', options: ['Pending', 'Processing', 'In transit', 'Delivered', 'Cancelled'] }, { name: 'payment', label: 'Payment', options: ['Paid', 'Failed', 'Refunded'] }]}
    selectable
        columns={[
          col.mono('id', 'Order'),
      col.strong('customer', 'Customer'),
      col.text('date', 'Date'),
      col.number('items', 'Items'),
      col.money('total', 'Total'),
      col.status('payment', 'Payment'),
      col.status(),
      col.rowActions({ label: 'order' }),
        ]}
      />
    </>
  )
}
