import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminCategories } from '@/data/admin'

export const metadata = { title: 'Categories' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Categories" description="Each category carries its own SEO record, breadcrumb title and structured data."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New category</AdminButton>} />
      <ListModule
        rows={adminCategories}
        searchKeys={['title', 'slug']}
        searchPlaceholder="Search categories…"
        filters={[{ name: 'status', label: 'Status', options: ['Published', 'Draft'] }]}
        columns={[
          col.titleCell({ header: 'Category' }),
      col.number('products', 'Products'),
      col.seoScore(),
      col.status(),
      col.text('updated', 'Updated'),
      col.rowActions({ label: 'category', editHrefBase: '/admin/categories' }),
        ]}
      />
    </>
  )
}
