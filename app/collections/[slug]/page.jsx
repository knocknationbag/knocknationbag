import { notFound } from 'next/navigation'

import PageHeader from '@/components/common/PageHeader'
import ProductListing from '@/components/product/ProductListing'
import { products } from '@/data/products'
import { collections, getCollection } from '@/data/catalog'

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) return {}

  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: `${collection.title} | Knock Nation Bag`,
      url: `/collections/${slug}`,
      images: [{ url: collection.image }],
    },
  }
}

export default async function CollectionPage({ params, searchParams }) {
  const { slug } = await params
  const query = await searchParams
  const collection = getCollection(slug)
  if (!collection) notFound()

  const items = products.filter(collection.match)

  return (
    <>
      <PageHeader
        eyebrow={collection.eyebrow}
        title={collection.title}
        description={collection.description}
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: collection.title }]}
      />
      <ProductListing products={items} params={query} basePath={`/collections/${slug}`} />
    </>
  )
}
