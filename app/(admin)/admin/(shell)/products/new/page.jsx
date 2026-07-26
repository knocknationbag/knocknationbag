import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import ProductEditor from '@/components/admin/product/ProductEditor'
import { categories } from '@/data/categories'
import { brands } from '@/data/catalog'

export const metadata = { title: 'New product' }

/**
 * Category and brand are plain text columns for now — this phase is scoped to
 * two tables. The existing static lists feed a datalist so entries stay
 * consistent without a lookup table pretending to be one.
 */
export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader
        title="New product"
        description="Saves as a Draft unless you set it otherwise. The slug is generated from the name and kept unique."
      />
      <ProductEditor
        categories={categories.map((c) => c.title)}
        brands={brands.map((b) => b.name)}
      />
    </>
  )
}
