import { SearchX } from 'lucide-react'

import Container from '@/components/layout/Container'
import ProductGrid from './ProductGrid'
import FilterSidebar from './FilterSidebar'
import FilterPanel from './FilterPanel'
import SortDropdown from './SortDropdown'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { buildFacets, filterProducts, paginate, sortProducts, buildQuery, toArray } from '@/utils/catalog'

/**
 * The single listing surface behind /shop, /category/[slug] and
 * /collections/[slug]. Filters, sort and pagination are all URL-driven, so this
 * stays a Server Component and every view is linkable.
 */
export default function ProductListing({ products, params = {}, basePath }) {
  const facets = buildFacets(products)
  const filtered = filterProducts(products, params)
  const sorted = sortProducts(filtered, params.sort)
  const { items, page, totalPages, total, from, to } = paginate(sorted, params.page)

  const activeCount =
    ['brand', 'color', 'material', 'price'].reduce((n, key) => n + toArray(params[key]).length, 0) +
    (params.stock === 'in' ? 1 : 0)

  return (
    <Container className="py-10 md:py-14 xl:py-16">
      <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-14">
        <FilterPanel activeCount={activeCount}>
          <FilterSidebar facets={facets} params={params} basePath={basePath} />
        </FilterPanel>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[15px] text-body" aria-live="polite">
              {total === 0 ? 'No products' : <>Showing <strong className="font-semibold text-ink">{from}–{to}</strong> of {total} products</>}
            </p>
            <SortDropdown params={params} basePath={basePath} />
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No products match those filters"
              description="Try removing a filter or widening the price range — the full range is always one click away."
              actionLabel="Clear filters"
              actionHref={basePath}
              secondaryLabel="Browse all products"
              secondaryHref="/shop"
            />
          ) : (
            <>
              <ProductGrid products={items} columns={3} priorityCount={3} />
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={(n) => `${basePath}${buildQuery(params, { page: n === 1 ? undefined : n })}`}
                className="mt-12"
              />
            </>
          )}
        </div>
      </div>
    </Container>
  )
}
