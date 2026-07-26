'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Collapses the filter facets behind a toggle below xl, where a full-height
 * sidebar would push every product off the first screen. At xl the panel is
 * always open and the toggle is hidden.
 *
 * Only the open/closed wrapper is client-side — the facets themselves stay
 * server-rendered links inside `children`, so filters work without JS at xl
 * and remain crawlable at every width.
 */
export default function FilterPanel({ children, activeCount = 0 }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="filter-facets"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-[15px] font-semibold text-ink transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold xl:hidden"
      >
        {open ? <X size={18} aria-hidden="true" /> : <SlidersHorizontal size={18} aria-hidden="true" />}
        {open ? 'Hide filters' : 'Show filters'}
        {activeCount > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-ink">
            {activeCount}
          </span>
        ) : null}
      </button>

      <div
        id="filter-facets"
        className={cn('mt-5 xl:mt-0 xl:block', open ? 'block' : 'hidden')}
      >
        {children}
      </div>
    </div>
  )
}
