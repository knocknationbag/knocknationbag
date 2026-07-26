import { Plus } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listProducts } from '@/lib/db/products'
import { PRODUCT_STATUSES } from '@/constants/recordStatus'
import { deleteProduct } from '@/lib/actions/products'
import { friendlyDbError } from '@/lib/db/errors'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Products' }

const PAGE_SIZE = 10

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)

  const { rows, total, error, setupRequired } = await listProducts({
    query: params?.q ?? '',
    status: params?.status ?? '',
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="The catalogue. Only Published products are readable by the storefront."
        actions={
          <AdminButton href="/admin/products/new" variant="primary" size="sm" icon={Plus}>
            New product
          </AdminButton>
        }
      />

      <ServerListModule
        rows={rows.map((p) => ({
          ...p,
          image: p.featuredImage,
          createdLabel: formatAdminDate(p.createdAt),
          displayPrice: p.salePrice ?? p.price,
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search name, SKU or slug…"
        filters={[{ name: 'status', label: 'Status', options: PRODUCT_STATUSES }]}
        deleteAction={deleteProduct}
        deleteDescription="This permanently deletes the product. Any storefront link to its URL will 404."
        emptyTitle="No products yet"
        emptyDescription="Create the first product to get started."
        columns={[
          { key: 'name', header: 'Product', type: 'title', imageKey: 'image', slugKey: 'slug', hrefBase: '/admin/products', linkKey: 'id', width: '30%' },
          { key: 'sku', header: 'SKU', type: 'mono' },
          { key: 'category', header: 'Category' },
          { key: 'displayPrice', header: 'Price', type: 'money', align: 'right' },
          { key: 'stock', header: 'Stock', type: 'stock', align: 'right' },
          { key: 'seoScore', header: 'SEO', type: 'seoScore', align: 'center' },
          { key: 'status', header: 'Status', type: 'status' },
          { key: 'createdLabel', header: 'Created' },
          { key: 'actions', header: '', type: 'actions', align: 'right', label: 'product', editHrefBase: '/admin/products', linkKey: 'id' },
        ]}
      />
    </>
  )
}
