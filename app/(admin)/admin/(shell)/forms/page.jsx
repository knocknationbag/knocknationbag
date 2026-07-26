import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminForms } from '@/data/admin'

export const metadata = { title: 'Forms' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Forms" description="Form definitions and their submissions." />
      <ListModule
        rows={adminForms}
        searchKeys={['name']}
        searchPlaceholder="Search forms…"
        filters={[{ name: 'status', label: 'Status', options: ['Active', 'Inactive'] }]}
        columns={[
          col.strong('name', 'Form'),
      col.number('submissions', 'Submissions'),
      col.number('unread', 'Unread'),
      col.text('lastEntry', 'Last entry'),
      col.status(),
      col.rowActions({ label: 'form' }),
        ]}
      />
    </>
  )
}
