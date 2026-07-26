'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

import AdminButton from './AdminButton'
import { cn } from '@/utils/cn'

/**
 * List-view toolbar: search, inline filter selects, and a slot for bulk or
 * primary actions. Shared by every module list so controls sit in the same
 * place everywhere.
 */
export default function Toolbar({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters = [],
  onFilterChange,
  onOpenFilters,
  resultCount,
  actions,
  className,
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 border-b border-border px-4 py-3', className)}>
      <div className="relative min-w-[180px] flex-1 sm:max-w-[280px]">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <label htmlFor="admin-toolbar-search" className="sr-only">{searchPlaceholder}</label>
        <input
          id="admin-toolbar-search"
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 w-full rounded-badge border border-border bg-surface pl-8 pr-2.5 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
        />
      </div>

      {filters.map((filter) => (
        <div key={filter.name} className="hidden lg:block">
          <label htmlFor={`filter-${filter.name}`} className="sr-only">{filter.label}</label>
          <select
            id={`filter-${filter.name}`}
            value={filter.value}
            onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
            className="h-8 rounded-badge border border-border bg-surface px-2.5 text-admin text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
          >
            <option value="">{filter.label}: All</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      {filters.length ? (
        <AdminButton size="sm" icon={SlidersHorizontal} onClick={onOpenFilters} className="lg:hidden">
          Filters
        </AdminButton>
      ) : null}

      {typeof resultCount === 'number' ? (
        <p className="hidden text-admin-sm text-muted xl:block" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'record' : 'records'}
        </p>
      ) : null}

      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </div>
  )
}
