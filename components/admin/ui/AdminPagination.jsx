'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Compact pager for admin tables. Reports the row window rather than only page
 * numbers, which is what matters when auditing a large catalogue.
 */
export default function AdminPagination({ page, pageSize, total, onPageChange, className }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const btn =
    'grid size-7 place-items-center rounded-badge border border-border text-body transition-colors ' +
    'hover:border-border-hover hover:text-ink disabled:opacity-40 disabled:hover:border-border ' +
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold'

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3', className)}>
      <p className="text-admin-sm text-muted">
        Showing <span className="font-semibold text-ink">{from}–{to}</span> of {total}
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1} aria-label="Previous page" className={btn}>
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
        <span className="px-1.5 text-admin-sm tabular-nums text-body">
          Page {page} / {totalPages}
        </span>
        <button type="button" onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages} aria-label="Next page" className={btn}>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
