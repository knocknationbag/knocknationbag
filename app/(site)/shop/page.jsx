import PageHeader from '@/components/common/PageHeader'
import ProductListing from '@/components/product/ProductListing'
import { getCatalog, getCategoryTree } from '@/lib/catalog'

export const metadata = {
  title: 'Shop All Bags',
  description:
    'The complete Knock Nation Bag range — backpacks, laptop bags, travel bags, handbags and more. Filter by price, brand, colour and material.',
  alternates: { canonical: '/shop' },
  openGraph: { title: 'Shop All Bags | Knock Nation Bag', url: '/shop' },
}

export default async function ShopPage({ searchParams }) {
  const [params, { products }, tree] = await Promise.all([searchParams, getCatalog(), getCategoryTree()])

  return (
    <>
      <PageHeader
        eyebrow="THE FULL RANGE"
        title="Shop All Bags"
        description={`Every bag we sell, in one place — ${products.length} product${products.length === 1 ? '' : 's'} across ${tree.length} categor${tree.length === 1 ? 'y' : 'ies'}.`}
        breadcrumbs={[{ label: 'Shop' }]}
      />
      <ProductListing products={products} params={params} basePath="/shop" />
    </>
  )
}
