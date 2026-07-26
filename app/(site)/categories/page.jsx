import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import CategoryCard from '@/components/common/CategoryCard'
import { categories } from '@/data/categories'
import { getProductsByCategory } from '@/data/products'

export const metadata = {
  title: 'All Categories',
  description:
    'Browse the Knock Nation Bag range by category — men, women, travel, laptop, office, backpacks, school and accessories.',
  alternates: { canonical: '/categories' },
  openGraph: { title: 'All Categories | Knock Nation Bag', url: '/categories' },
}

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="ARCHITECTURAL CURATION"
        title="Shop by Category"
        description="Eight categories, each drawn around a specific way of carrying rather than a trend."
        breadcrumbs={[{ label: 'Categories' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-6">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard {...category} className="!flex md:!block" />
              <p className="mt-2 hidden text-[13px] text-body md:block">
                {getProductsByCategory(category.slug).length} products
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
