import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import { getCategory, listCategoryOptions } from '@/lib/db/categories'

export const metadata = { title: 'Edit category' }

export default async function EditCategoryPage({ params }) {
  const { id } = await params
  const [{ category, error }, options] = await Promise.all([getCategory(id), listCategoryOptions()])

  if (error) {
    return (
      <>
        <AdminPageHeader title="Edit category" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!category) notFound()

  return (
    <>
      <AdminPageHeader
        title={category.name}
        description={`${category.productCount} product${category.productCount === 1 ? '' : 's'} · ${category.status}`}
      />
      <CategoryForm
        category={category}
        parents={options.filter((c) => !c.parentId)}
        hasChildren={options.some((c) => c.parentId === category.id)}
      />
    </>
  )
}
