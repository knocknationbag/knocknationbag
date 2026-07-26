import Link from 'next/link'

import { PRICE_RANGES } from '@/data/catalog'
import { buildQuery, toArray } from '@/utils/catalog'
import { cn } from '@/utils/cn'

/**
 * Filters are links, not form state — the URL is the source of truth so results
 * stay shareable, bookmarkable and crawlable (docs/CLAUDE.md §14). That also
 * keeps this a Server Component with zero client JS.
 */
function FacetGroup({ heading, options, param, active, params, basePath }) {
  if (!options.length) return null

  return (
    <div className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <h3 className="font-mono text-eyebrow uppercase text-gold">{heading}</h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {options.map((option) => {
          const value = option.id ?? option
          const label = option.label ?? option
          const isOn = active.includes(value)
          const next = isOn ? active.filter((v) => v !== value) : [...active, value]

          return (
            <li key={value}>
              <Link
                href={`${basePath}${buildQuery(params, { [param]: next, page: undefined })}`}
                scroll={false}
                aria-pressed={isOn}
                className="group flex items-center gap-3 text-[15px] text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors',
                    isOn ? 'border-ink bg-ink' : 'border-border group-hover:border-border-hover',
                  )}
                >
                  {isOn ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                <span className={cn(isOn && 'font-semibold text-ink')}>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function FilterSidebar({ facets, params = {}, basePath, className }) {
  const hasFilters = ['brand', 'color', 'material', 'price', 'stock'].some((k) => params[k])

  return (
    <aside className={cn('w-full', className)} aria-label="Product filters">
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-[17px] font-bold text-ink">Filter</h2>
        {hasFilters ? (
          <Link
            href={basePath}
            className="text-[14px] font-semibold text-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Clear all
          </Link>
        ) : null}
      </div>

      <FacetGroup heading="Price" options={PRICE_RANGES} param="price" active={toArray(params.price)} params={params} basePath={basePath} />
      <FacetGroup heading="Product line" options={facets.brands} param="brand" active={toArray(params.brand)} params={params} basePath={basePath} />
      <FacetGroup heading="Colour" options={facets.colors} param="color" active={toArray(params.color)} params={params} basePath={basePath} />
      <FacetGroup heading="Material" options={facets.materials} param="material" active={toArray(params.material)} params={params} basePath={basePath} />

      <div className="border-t border-border py-6">
        <h3 className="font-mono text-eyebrow uppercase text-gold">Availability</h3>
        <Link
          href={`${basePath}${buildQuery(params, { stock: params.stock === 'in' ? undefined : 'in', page: undefined })}`}
          scroll={false}
          aria-pressed={params.stock === 'in'}
          className="group mt-4 flex items-center gap-3 text-[15px] text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors',
              params.stock === 'in' ? 'border-ink bg-ink' : 'border-border group-hover:border-border-hover',
            )}
          >
            {params.stock === 'in' ? (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
          <span className={cn(params.stock === 'in' && 'font-semibold text-ink')}>In stock only</span>
        </Link>
      </div>
    </aside>
  )
}
