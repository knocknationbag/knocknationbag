import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ProductEditor from '@/components/admin/product/ProductEditor'
import { listBrands } from '@/lib/db/products'
import { listCategoryOptions } from '@/lib/db/categories'

export const metadata = { title: 'New product' }

/** Categories come from the Categories module; brand suggestions from existing products. */
export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([listCategoryOptions(), listBrands()])

  return (
    <>
      <AdminPageHeader
        title="New product"
        description="Saves as a Draft unless you set it otherwise. The slug is generated from the name and kept unique."
      />
      <ProductEditor
        categories={categories}
        brands={brands}
      />
    </>
  )
}
