import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminCustomers } from '@/data/admin'

export const metadata = { title: 'Customers' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Customers" description="Accounts, order history and lifetime value." />
      <ListModule
        rows={adminCustomers}
        searchKeys={['name', 'email']}
        searchPlaceholder="Search customers…"
        filters={[{ name: 'status', label: 'Status', options: ['Active', 'Inactive'] }]}
        columns={[
          col.strong('name', 'Customer'),
      col.text('email', 'Email'),
      col.number('orders', 'Orders'),
      col.money('spent', 'Lifetime value'),
      col.text('tier', 'Tier'),
      col.text('joined', 'Joined'),
      col.status(),
      col.rowActions({ label: 'customer' }),
        ]}
      />
    </>
  )
}
