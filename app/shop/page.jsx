import PageHeader from '@/components/common/PageHeader'
import ProductListing from '@/components/product/ProductListing'
import { products } from '@/data/products'

export const metadata = {
  title: 'Shop All Bags',
  description:
    'The complete Knock Nation Bag range — leather totes, technical backpacks, luggage and business carry. Filter by price, product line, colour and material.',
  alternates: { canonical: '/shop' },
  openGraph: { title: 'Shop All Bags | Knock Nation Bag', url: '/shop' },
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams

  return (
    <>
      <PageHeader
        eyebrow="THE FULL RANGE"
        title="Shop All Bags"
        description={`Every piece we make, in one place. ${products.length} products across eight categories, each covered by a three-year warranty and lifetime repair.`}
        breadcrumbs={[{ label: 'Shop' }]}
      />
      <ProductListing products={products} params={params} basePath="/shop" />
    </>
  )
}
