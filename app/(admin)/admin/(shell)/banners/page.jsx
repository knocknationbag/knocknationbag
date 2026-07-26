import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminBanners } from '@/data/admin'

export const metadata = { title: 'Banners' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Banners" description="Promotional strips and hero banners by placement."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New banner</AdminButton>} />
      <ListModule
        rows={adminBanners}
        searchKeys={['name', 'placement']}
        searchPlaceholder="Search banners…"
        filters={[{ name: 'status', label: 'Status', options: ['Published', 'Draft', 'Scheduled'] }]}
        columns={[
          col.strong('name', 'Banner'),
      col.text('placement', 'Placement'),
      col.text('starts', 'Starts'),
      col.text('ends', 'Ends'),
      col.status(),
      col.rowActions({ label: 'banner' }),
        ]}
      />
    </>
  )
}
