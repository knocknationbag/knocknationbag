import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminCoupons } from '@/data/admin'

export const metadata = { title: 'Coupons' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Coupons" description="Discount codes and their usage."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New coupon</AdminButton>} />
      <ListModule
        rows={adminCoupons}
        searchKeys={['code', 'type']}
        searchPlaceholder="Search coupons…"
        filters={[{ name: 'status', label: 'Status', options: ['Active', 'Archived'] }]}
        columns={[
          col.mono('code', 'Code'),
      col.text('type', 'Type'),
      col.strong('value', 'Value'),
      col.text('uses', 'Uses'),
      col.text('expires', 'Expires'),
      col.status(),
      col.rowActions({ label: 'coupon' }),
        ]}
      />
    </>
  )
}
