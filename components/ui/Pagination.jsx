import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Real <a href> pagination so pages are crawlable (docs/seo.md §7).
 * `buildHref(page)` keeps existing filter/sort params intact.
 */
export default function Pagination({ page, totalPages, buildHref, className }) {
  if (totalPages <= 1) return null

  const pages = []
  const push = (n) => pages.push(n)
  push(1)
  for (let n = page - 1; n <= page + 1; n += 1) if (n > 1 && n < totalPages) push(n)
  if (totalPages > 1) push(totalPages)
  const unique = [...new Set(pages)].sort((a, b) => a - b)

  const linkBase =
    'grid h-10 min-w-10 place-items-center rounded-full px-3 text-[15px] font-medium transition-colors ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-2', className)}>
      {page > 1 ? (
        <Link href={buildHref(page - 1)} rel="prev" aria-label="Previous page" className={cn(linkBase, 'border border-border text-ink hover:border-border-hover')}>
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(linkBase, 'border border-border text-muted opacity-50')} aria-hidden="true">
          <ChevronLeft size={18} />
        </span>
      )}

      {unique.map((n, i) => {
        const gap = i > 0 && n - unique[i - 1] > 1
        return (
          <span key={n} className="flex items-center gap-2">
            {gap ? <span className="px-1 text-muted">…</span> : null}
            <Link
              href={buildHref(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              className={cn(
                linkBase,
                n === page
                  ? 'bg-ink text-white'
                  : 'border border-border text-ink hover:border-border-hover',
              )}
            >
              {n}
            </Link>
          </span>
        )
      })}

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} rel="next" aria-label="Next page" className={cn(linkBase, 'border border-border text-ink hover:border-border-hover')}>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(linkBase, 'border border-border text-muted opacity-50')} aria-hidden="true">
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  )
}
