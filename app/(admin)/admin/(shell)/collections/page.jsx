import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminCollections } from '@/data/admin'

export const metadata = { title: 'Collections' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Collections" description="Curated edits. Membership is rule-based, so a collection updates itself as the catalogue changes."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New collection</AdminButton>} />
      <ListModule
        rows={adminCollections}
        searchKeys={['title', 'slug']}
        searchPlaceholder="Search collections…"
        filters={[{ name: 'status', label: 'Status', options: ['Published', 'Scheduled', 'Draft'] }]}
        columns={[
          col.titleCell({ header: 'Collection' }),
      col.number('products', 'Products'),
      col.seoScore(),
      col.status(),
      col.text('updated', 'Updated'),
      col.rowActions({ label: 'collection' }),
        ]}
      />
    </>
  )
}
