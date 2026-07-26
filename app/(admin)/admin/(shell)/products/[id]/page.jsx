import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import ProductEditor from '@/components/admin/product/ProductEditor'
import { getProduct } from '@/lib/db/products'
import { categories } from '@/data/categories'
import { brands } from '@/data/catalog'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Edit product' }

export default async function EditProductPage({ params }) {
  const { id } = await params
  const { product, error } = await getProduct(id)

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
        categories={categories.map((c) => c.title)}
        brands={brands.map((b) => b.name)}
      />
    </>
  )
}
