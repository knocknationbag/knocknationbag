import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminBrands } from '@/data/admin'

export const metadata = { title: 'Brands' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Brands" description="Product lines. Each has its own landing page and SEO record."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New brand</AdminButton>} />
      <ListModule
        rows={adminBrands}
        searchKeys={['title', 'description']}
        searchPlaceholder="Search brands…"
        columns={[
          col.titleCell({ header: 'Brand' }),
      col.text('description', 'Description'),
      col.number('products', 'Products'),
      col.seoScore(),
      col.status(),
      col.rowActions({ label: 'brand' }),
        ]}
      />
    </>
  )
}
