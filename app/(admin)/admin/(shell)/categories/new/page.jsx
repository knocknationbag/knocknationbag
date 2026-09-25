import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import { listCategoryOptions } from '@/lib/db/categories'

export const metadata = { title: 'New category' }

export default async function NewCategoryPage() {
  const options = await listCategoryOptions()

  return (
    <>
      <AdminPageHeader title="New category" description="Appears in the shop as soon as it is Active and has products." />
      <CategoryForm parents={options.filter((c) => !c.parentId)} />
    </>
  )
}
