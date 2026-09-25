import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import ProductEditor from '@/components/admin/product/ProductEditor'
import { getProduct, listBrands } from '@/lib/db/products'
import { listCategoryOptions } from '@/lib/db/categories'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Edit product' }

export default async function EditProductPage({ params }) {
  const { id } = await params
  const [{ product, error }, categories, brands] = await Promise.all([getProduct(id), listCategoryOptions(), listBrands()])

  if (error) {
    return (
      <>
        <AdminPageHeader title="Edit product" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!product) notFound()

  return (
    <>
      <AdminPageHeader
        title={product.name}
        description={`${product.status} · created ${formatAdminDate(product.createdAt)} · SEO score ${product.seoScore}`}
      />
      <ProductEditor
        product={product}
        categories={categories}
        brands={brands}
      />
    </>
  )
}
