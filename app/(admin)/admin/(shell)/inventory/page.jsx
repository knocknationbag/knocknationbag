import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { inventoryRows } from '@/data/admin'

export const metadata = { title: 'Inventory' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Inventory" description="Stock on hand across the catalogue." />
      <ListModule
        rows={inventoryRows}
        searchKeys={['title', 'sku']}
        searchPlaceholder="Search by product or SKU…"
        filters={[{ name: 'status', label: 'Status', options: ['In stock', 'Low stock', 'Out of stock'] }]}
        columns={[
          col.titleCell({ header: 'Product', slugKey: 'sku' }),
      col.stockCell('stock', 'On hand'),
      col.number('reserved', 'Reserved'),
      col.status(),
      col.text('location', 'Location'),
      col.rowActions({ label: 'stock record' }),
        ]}
      />
    </>
  )
}
