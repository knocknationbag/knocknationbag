import Link from 'next/link'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import CategoryCard from '@/components/common/CategoryCard'
import EmptyState from '@/components/ui/EmptyState'
import { getCategoryTree } from '@/lib/catalog'

export const metadata = {
  title: 'All Categories',
  description: 'Browse every Knock Nation Bag category — backpacks, laptop bags, travel bags, handbags and more.',
  alternates: { canonical: '/categories' },
  openGraph: { title: 'All Categories | Knock Nation Bag', url: '/categories' },
}

export default async function CategoriesPage() {
  const tree = await getCategoryTree()

  return (
    <>
      <PageHeader
        eyebrow="SHOP BY CATEGORY"
        title="All Categories"
        description="Find the right bag for the way you carry."
        breadcrumbs={[{ label: 'Categories' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        {tree.length === 0 ? (
          <EmptyState title="No categories yet" description="Check back soon." actionLabel="Shop all bags" actionHref="/shop" />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-6">
            {tree.map((category) => (
              <li key={category.id}>
                <CategoryCard slug={category.slug} title={category.title} image={category.image} imageAlt={category.imageAlt} className="!flex md:!block" />
                <p className="mt-2 text-[13px] text-body">
                  {category.productCount} product{category.productCount === 1 ? '' : 's'}
                </p>
                {category.children.length ? (
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link href={`/category/${child.slug}`} className="text-[13px] font-semibold text-ink underline-offset-4 hover:text-gold hover:underline">
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}
