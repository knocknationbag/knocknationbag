import { notFound } from 'next/navigation'

import PageHeader from '@/components/common/PageHeader'
import ProductListing from '@/components/product/ProductListing'
import { getProductsByCategory } from '@/data/products'
import { categories } from '@/data/categories'
import { getCategory } from '@/data/catalog'

const COPY = {
  men: 'Structured carry for work and weekend — messengers, holdalls and packs cut for a longer torso.',
  women: 'Totes, crossbodies and top-handles in hand-finished leather, built to hold their shape.',
  travel: 'Cabin-sized luggage, clamshell packs and weekenders engineered for repeat transits.',
  laptop: 'Suspended sleeves and side-entry access for machines from 13 to 16 inches.',
  office: 'Briefcases and satchels that keep documents flat and open in one motion.',
  backpack: 'Roll-tops, daypacks and commuters in waxed canvas and recycled technical weaves.',
  school: 'Lightweight campus packs with reinforced bases rated for a full textbook load.',
  accessories: 'Folios, organisers and compact pieces that finish a carry system.',
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const category = getCategory(slug)
  if (!category) return {}

  return {
    title: `${category.title} Bags`,
    description: COPY[slug] ?? `Shop ${category.title} bags from Knock Nation Bag.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${category.title} Bags | Knock Nation Bag`,
      url: `/category/${slug}`,
      images: [{ url: category.image }],
    },
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params
  const query = await searchParams
  const category = getCategory(slug)
  if (!category) notFound()

  const items = getProductsByCategory(slug)

  return (
    <>
      <PageHeader
        eyebrow="ARCHITECTURAL CURATION"
        title={`${category.title} Bags`}
        description={COPY[slug]}
        breadcrumbs={[{ label: 'Shop', href: '/shop' }, { label: category.title }]}
      />
      <ProductListing products={items} params={query} basePath={`/category/${slug}`} />
    </>
  )
}
