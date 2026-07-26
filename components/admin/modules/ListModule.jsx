'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import DataTable from '@/components/admin/ui/DataTable'
import Toolbar from '@/components/admin/ui/Toolbar'
import AdminPagination from '@/components/admin/ui/AdminPagination'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import { ConfirmDialog, SideDrawer } from '@/components/admin/ui/Overlay'

/**
 * Generic searchable, filterable, paginated list.
 *
 * Every module that is "a table of records" renders through this — categories,
 * collections, brands, orders, customers, users, redirects, reviews, coupons,
 * logs, forms, banners, pages, blog. One implementation means search, filters,
 * pagination, empty states and the delete dialog behave identically everywhere,
 * and a new module is a column definition rather than a new screen.
 *
 * `columns` uses the DataTable contract. `searchKeys` names the fields the
 * search box matches against.
 */
export default function ListModule({
  rows,
  columns,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  filters = [],
  pageSize = 10,
  selectable = false,
  actions,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Records will appear once they are created.',
  deleteDescription,
  getRowKey,
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState({})
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q && searchKeys.length) {
        const haystack = searchKeys.map((k) => row[k]).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return Object.entries(active).every(([key, value]) => !value || String(row[key]) === value)
    })
  }, [rows, query, active, searchKeys])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const filterDefs = filters.map((f) => ({ ...f, value: active[f.name] ?? '' }))

  return (
    <>
      <AdminCard padded={false}>
        <Toolbar
          searchPlaceholder={searchPlaceholder}
          searchValue={query}
          onSearchChange={(v) => { setQuery(v); setPage(1) }}
          filters={filterDefs}
          onFilterChange={(name, value) => { setActive((a) => ({ ...a, [name]: value })); setPage(1) }}
          onOpenFilters={() => setFiltersOpen(true)}
          resultCount={filtered.length}
          actions={actions}
        />

        {paged.length === 0 ? (
          <AdminEmptyState
            icon={query || Object.values(active).some(Boolean) ? Search : undefined}
            title={query || Object.values(active).some(Boolean) ? 'No matching records' : emptyTitle}
            description={query || Object.values(active).some(Boolean) ? 'Try a different search term or clear the filters.' : emptyDescription}
            actionLabel={query || Object.values(active).some(Boolean) ? 'Clear filters' : undefined}
            onAction={() => { setQuery(''); setActive({}); setPage(1) }}
          />
        ) : (
          <>
            <DataTable
              rows={paged}
              columns={columns}
              selectable={selectable}
              getRowKey={getRowKey}
              onDelete={setPendingDelete}
            />
            <AdminPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </AdminCard>

      <SideDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" width="sm">
        <div className="flex flex-col gap-3">
          {filterDefs.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label htmlFor={`lm-${f.name}`} className="text-admin-sm font-semibold text-ink">{f.label}</label>
              <select
                id={`lm-${f.name}`}
                value={f.value}
                onChange={(e) => { setActive((a) => ({ ...a, [f.name]: e.target.value })); setPage(1) }}
                className="h-9 rounded-badge border border-border bg-surface px-2.5 text-admin text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
              >
                <option value="">All</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </SideDrawer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => setPendingDelete(null)}
        title="Delete this record?"
        description={deleteDescription ?? 'This action cannot be undone.'}
      />
    </>
  )
}
