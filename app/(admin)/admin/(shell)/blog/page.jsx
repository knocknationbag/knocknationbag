import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ListModule from '@/components/admin/modules/ListModule'
import * as col from '@/components/admin/modules/columns'
import { adminBlog } from '@/data/admin'

export const metadata = { title: 'Blog' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Blog" description="Posts, drafts and scheduled articles. Each carries a full SEO record."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New post</AdminButton>} />
      <ListModule
        rows={adminBlog}
        searchKeys={['title', 'slug', 'author']}
        searchPlaceholder="Search posts…"
        filters={[{ name: 'status', label: 'Status', options: ['Published', 'Draft', 'Scheduled'] }]}
        columns={[
          col.titleCell({ header: 'Post' }),
      col.text('author', 'Author'),
      col.seoScore(),
      col.status(),
      col.text('updated', 'Updated'),
      col.rowActions({ label: 'post' }),
        ]}
      />
    </>
  )
}
