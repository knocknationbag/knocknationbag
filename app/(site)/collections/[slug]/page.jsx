import { notFound } from 'next/navigation'

import PageHeader from '@/components/common/PageHeader'
import ProductListing from '@/components/product/ProductListing'
import { COLLECTIONS, COLLECTION_ALIASES } from '@/constants/catalog'
import { getCollectionProducts } from '@/lib/catalog'

export function generateStaticParams() {
  return [...COLLECTIONS.map((c) => c.slug), ...Object.keys(COLLECTION_ALIASES)].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const result = await getCollectionProducts(slug)
  if (!result) return {}
  const { collection } = result

  return {
    title: collection.title,
    description: collection.description,
    // An alias (e.g. best-sellers) canonicalises to the collection it shows.
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { title: `${collection.title} | Knock Nation Bag`, url: `/collections/${collection.slug}` },
  }
}

export default async function CollectionPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const result = await getCollectionProducts(slug)
  if (!result) notFound()
  const { collection, products } = result

  return (
    <>
      <PageHeader
        eyebrow={collection.eyebrow}
        title={collection.title}
        description={collection.description}
        breadcrumbs={[{ label: 'Collections', href: '/collections' }, { label: collection.title }]}
      />
      <ProductListing products={products} params={query} basePath={`/collections/${slug}`} />
    </>
  )
}
