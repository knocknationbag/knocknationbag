import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminReviews } from '@/data/admin'

export const metadata = { title: 'Reviews' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Reviews" description="Moderation queue for customer reviews." />
      <ListModule
        rows={adminReviews}
        searchKeys={['product', 'author', 'excerpt']}
        searchPlaceholder="Search reviews…"
        filters={[{ name: 'status', label: 'Status', options: ['Approved', 'Pending', 'Rejected'] }]}
        columns={[
          col.strong('product', 'Product'),
      col.text('author', 'Author'),
      col.number('rating', 'Rating'),
      col.text('excerpt', 'Excerpt'),
      col.text('date', 'Date'),
      col.status(),
      col.rowActions({ label: 'review' }),
        ]}
      />
    </>
  )
}
