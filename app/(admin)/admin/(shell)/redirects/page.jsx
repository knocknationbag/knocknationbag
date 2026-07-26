import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminRedirects } from '@/data/admin'

export const metadata = { title: 'Redirects' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Redirects" description="301 and 302 rules. Changing a published slug creates one automatically."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New redirect</AdminButton>} />
      <ListModule
        rows={adminRedirects}
        searchKeys={['from', 'to']}
        searchPlaceholder="Search redirects…"
        filters={[{ name: 'type', label: 'Type', options: ['301', '302', '410'] }, { name: 'status', label: 'Status', options: ['Active', 'Inactive'] }]}
        columns={[
          col.mono('from', 'From'),
      col.mono('to', 'To'),
      col.text('type', 'Type'),
      col.number('hits', 'Hits'),
      col.status(),
      col.rowActions({ label: 'redirect' }),
        ]}
      />
    </>
  )
}
