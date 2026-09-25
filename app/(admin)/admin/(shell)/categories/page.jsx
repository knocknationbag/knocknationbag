import { Plus } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listCategories } from '@/lib/db/categories'
import { deleteCategory } from '@/lib/actions/categories'
import { friendlyDbError } from '@/lib/db/errors'

export const metadata = { title: 'Categories' }

/**
 * All categories on one page, each main category followed by its
 * subcategories. A catalogue has tens of categories, not thousands, so there
 * is no paging.
 */
export default async function AdminCategoriesPage({ searchParams }) {
  const params = await searchParams
  const { rows, total, error, setupRequired } = await listCategories({
    query: params?.q ?? '',
    status: params?.status ?? '',
  })

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="How customers browse the shop. Subcategories sit one level under a main category."
        actions={
          <AdminButton href="/admin/categories/new" variant="primary" size="sm" icon={Plus}>
            New category
          </AdminButton>
        }
      />

      <ServerListModule
        rows={rows.map((c) => ({
          ...c,
          name: c.depth ? `↳ ${c.name}` : c.name,
          image: c.imageUrl,
          type: c.depth ? `Sub of ${c.parentName}` : 'Main',
        }))}
        total={total}
        page={1}
        pageSize={Math.max(total, 1)}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search categories…"
        filters={[{ name: 'status', label: 'Status', options: ['Active', 'Hidden'] }]}
        deleteAction={deleteCategory}
        deleteDescription="Products in this category are kept but become uncategorised. A category with subcategories cannot be deleted until they are moved or deleted."
        emptyTitle="No categories yet"
        emptyDescription="Create the first category to organise the shop."
        columns={[
          { key: 'name', header: 'Category', type: 'title', imageKey: 'image', slugKey: 'slug', hrefBase: '/admin/categories', linkKey: 'id', width: '36%' },
          { key: 'type', header: 'Level' },
          { key: 'productCount', header: 'Products', type: 'number', align: 'right' },
          { key: 'sortOrder', header: 'Order', type: 'number', align: 'right' },
          { key: 'status', header: 'Status', type: 'status' },
          { key: 'actions', header: '', type: 'actions', align: 'right', label: 'category', editHrefBase: '/admin/categories', linkKey: 'id' },
        ]}
      />
    </>
  )
}
