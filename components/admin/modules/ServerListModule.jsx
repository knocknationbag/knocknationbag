'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Database, Search } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import DataTable from '@/components/admin/ui/DataTable'
import Toolbar from '@/components/admin/ui/Toolbar'
import AdminPagination from '@/components/admin/ui/AdminPagination'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import { ConfirmDialog } from '@/components/admin/ui/Overlay'
import AuthMessage from '@/components/admin/auth/AuthMessage'

/**
 * List for modules backed by the database.
 *
 * Search, filters and page live in the URL, so a filtered view is shareable,
 * bookmarkable and survives a refresh — and the server does the paging, which
 * is what lets this work when the catalogue outgrows one page of rows
 * (docs/CLAUDE.md §14, §21).
 *
 * ListModule remains for the static modules; it filters an in-memory array,
 * which is a different problem and would bloat this one.
 */
export default function ServerListModule({
  rows,
  columns,
  total,
  page,
  pageSize = 10,
  searchPlaceholder = 'Search…',
  filters = [],
  deleteAction,
  deleteDescription,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Records will appear once they are created.',
  setupRequired = false,
  error,
  actions,
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteState, runDelete, deleting] = useActionState(deleteAction ?? (() => ({ ok: false })), { ok: false })

  function push(next) {
    const search = new URLSearchParams(params.toString())
    Object.entries(next).forEach(([key, value]) => {
      if (value) search.set(key, value)
      else search.delete(key)
    })
    if (!('page' in next)) search.delete('page')
    startTransition(() => router.push(`${pathname}?${search.toString()}`, { scroll: false }))
  }

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    if ((params.get('q') ?? '') === query) return undefined
    const timer = setTimeout(() => push({ q: query }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  if (setupRequired) {
    return (
      <AdminCard>
        <AdminEmptyState
          icon={Database}
          title="Database not set up yet"
          description="This module reads from Supabase. Apply the migrations in supabase/migrations, then reload this page."
        />
      </AdminCard>
    )
  }

  const hasFilters = Boolean(query || filters.some((f) => params.get(f.name)))

  return (
    <>
      {error ? <AuthMessage tone="error" className="mb-3">{error}</AuthMessage> : null}
      {deleteState?.error ? <AuthMessage tone="error" className="mb-3">{deleteState.error}</AuthMessage> : null}

      <AdminCard padded={false} className={isPending ? 'opacity-60 transition-opacity' : undefined}>
        <Toolbar
          searchPlaceholder={searchPlaceholder}
          searchValue={query}
          onSearchChange={setQuery}
          filters={filters.map((f) => ({ ...f, value: params.get(f.name) ?? '' }))}
          onFilterChange={(name, value) => push({ [name]: value })}
          resultCount={total}
          actions={actions}
        />

        {rows.length === 0 ? (
          <AdminEmptyState
            icon={hasFilters ? Search : undefined}
            title={hasFilters ? 'No matching records' : emptyTitle}
            description={hasFilters ? 'Try a different search term or clear the filters.' : emptyDescription}
            actionLabel={hasFilters ? 'Clear filters' : undefined}
            onAction={() => {
              setQuery('')
              push(Object.fromEntries([['q', ''], ...filters.map((f) => [f.name, ''])]))
            }}
          />
        ) : (
          <>
            <DataTable
              rows={rows}
              columns={columns}
              getRowKey={(r) => r.id}
              onDelete={deleteAction ? setPendingDelete : undefined}
            />
            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(next) => push({ page: next > 1 ? String(next) : '' })}
            />
          </>
        )}
      </AdminCard>

      {/*
        Closing is derived, not an effect: once the delete succeeds the row is
        gone from the revalidated list, so "is it still listed?" answers the
        question without a setState that would cascade a render.
      */}
      <ConfirmDialog
        open={Boolean(pendingDelete) && rows.some((r) => r.id === pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
        title={`Delete ${pendingDelete?.name || 'this record'}?`}
        description={deleteDescription ?? 'This cannot be undone.'}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onConfirm={() => {
          const data = new FormData()
          data.set('id', pendingDelete.id)
          runDelete(data)
        }}
      />
    </>
  )
}
