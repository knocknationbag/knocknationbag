import Link from 'next/link'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/common/PageHeader'
import ProductListing from '@/components/product/ProductListing'
import { getCatalog, getCategoryBySlug, getProductsInCategory, PLACEHOLDER_IMAGE } from '@/lib/catalog'

/** Pre-render every active category; new ones render on first visit. */
export async function generateStaticParams() {
  const { categories } = await getCatalog()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  const title = category.seo.title || `${category.title}`
  const description = category.seo.description || `Shop ${category.title.toLowerCase()} from Knock Nation Bag.`
  const image = category.seo.ogImage || (category.image !== PLACEHOLDER_IMAGE ? category.image : null)

  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${title} | Knock Nation Bag`,
      description,
      url: `/category/${slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const items = await getProductsInCategory(category)
  const crumbs = [
    { label: 'Shop', href: '/shop' },
    ...(category.parent ? [{ label: category.parent.title, href: `/category/${category.parent.slug}` }] : []),
    { label: category.title },
  ]

  return (
    <>
      <PageHeader
        eyebrow={category.parent ? category.parent.title.toUpperCase() : 'SHOP BY CATEGORY'}
        title={category.title}
        description={category.description || `${items.length} product${items.length === 1 ? '' : 's'} in ${category.title}.`}
        breadcrumbs={crumbs}
      >
        {category.children.length ? (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${category.title} subcategories`}>
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/category/${child.slug}`}
                  className="inline-block rounded-full border border-border bg-surface px-4 py-2 text-[14px] text-ink transition-colors hover:border-border-hover hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </PageHeader>
      <ProductListing products={items} params={query} basePath={`/category/${slug}`} />
    </>
  )
}
