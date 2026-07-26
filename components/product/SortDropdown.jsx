import Link from 'next/link'

import { SORT_OPTIONS } from '@/data/catalog'
import { buildQuery } from '@/utils/catalog'
import { cn } from '@/utils/cn'

/**
 * Sort as links rather than a <select>, so it works without JS and each sorted
 * view has its own crawlable URL. Rendered as a focus-within disclosure.
 */
export default function SortDropdown({ params = {}, basePath, className }) {
  const current = SORT_OPTIONS.find((o) => o.id === params.sort) ?? SORT_OPTIONS[0]

  return (
    <div className={cn('group relative', className)}>
      <button
        type="button"
        aria-haspopup="true"
        className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[14px] font-semibold text-ink transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Sort: {current.label}
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <ul className="pointer-events-none invisible absolute right-0 top-full z-30 mt-2 w-56 rounded-card border border-border bg-surface py-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        {SORT_OPTIONS.map((option) => (
          <li key={option.id}>
            <Link
              href={`${basePath}${buildQuery(params, { sort: option.id === 'featured' ? undefined : option.id, page: undefined })}`}
              scroll={false}
              aria-current={option.id === current.id ? 'true' : undefined}
              className={cn(
                'block px-5 py-2.5 text-[14px] transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
                option.id === current.id ? 'font-bold text-ink' : 'text-body',
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
