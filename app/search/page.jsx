import { SearchX } from 'lucide-react'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import ProductGrid from '@/components/product/ProductGrid'
import EmptyState from '@/components/ui/EmptyState'
import SearchField from '@/components/common/SearchField'
import { products } from '@/data/products'
import { searchProducts } from '@/utils/catalog'
import { categories } from '@/data/categories'
import Link from 'next/link'

export const metadata = {
  title: 'Search',
  description: 'Search the full Knock Nation Bag range by name, category, colour or material.',
  // Query-driven results should not be indexed — docs/seo.md §1.
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }) {
  const { q = '' } = await searchParams
  const query = String(q).trim()
  const results = query ? searchProducts(products, query) : []

  return (
    <>
      <PageHeader
        eyebrow="FIND IT FAST"
        title={query ? `Results for “${query}”` : 'Search'}
        description={
          query
            ? `${results.length} ${results.length === 1 ? 'product matches' : 'products match'} your search.`
            : 'Search the full range by product name, category, colour or material.'
        }
        breadcrumbs={[{ label: 'Search' }]}
      >
        <div className="mt-6 max-w-[520px]">
          <SearchField defaultValue={query} />
        </div>
      </PageHeader>

      <Container className="py-10 md:py-14 xl:py-16">
        {query && results.length > 0 ? (
          <section aria-labelledby="search-results">
            <h2 id="search-results" className="sr-only">Search results</h2>
            <ProductGrid products={results} columns={4} priorityCount={4} />
          </section>
        ) : query ? (
          <EmptyState
            icon={SearchX}
            title={`Nothing matches “${query}”`}
            description="Try a broader term, or browse by category — the range is only 28 pieces, so it is quick to scan."
            actionLabel="Shop all bags"
            actionHref="/shop"
            secondaryLabel="Browse categories"
            secondaryHref="/categories"
          />
        ) : (
          <div>
            <p className="font-mono text-eyebrow uppercase text-gold">Browse by category</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="inline-block rounded-full border border-border px-4 py-2 text-[14px] text-ink transition-colors hover:border-border-hover hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </>
  )
}
