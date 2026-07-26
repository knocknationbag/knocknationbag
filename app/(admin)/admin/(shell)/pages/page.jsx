import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminPages } from '@/data/admin'

export const metadata = { title: 'CMS Pages' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="CMS Pages" description="Editable content pages. Every page has the full SEO field set."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New page</AdminButton>} />
      <ListModule
        rows={adminPages}
        searchKeys={['title', 'slug', 'type']}
        searchPlaceholder="Search pages…"
        filters={[{ name: 'type', label: 'Type', options: ['Landing', 'Standard', 'Policy', 'FAQ'] }, { name: 'status', label: 'Status', options: ['Published', 'Draft'] }]}
        columns={[
          col.titleCell({ header: 'Page' }),
      col.text('type', 'Type'),
      col.seoScore(),
      col.status(),
      col.text('updated', 'Updated'),
      col.rowActions({ label: 'page', editHrefBase: '/admin/pages' }),
        ]}
      />
    </>
  )
}
