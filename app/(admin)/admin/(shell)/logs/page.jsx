import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminLogs } from '@/data/admin'

export const metadata = { title: 'Activity Logs' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Activity Logs" description="Every write action, who performed it and when." />
      <ListModule
        rows={adminLogs}
        searchKeys={['actor', 'action', 'target']}
        searchPlaceholder="Search activity…"
        columns={[
          col.strong('actor', 'User'),
      col.text('action', 'Action'),
      col.text('target', 'Target'),
      col.text('at', 'When'),
      col.mono('ip', 'IP'),
        ]}
      />
    </>
  )
}
