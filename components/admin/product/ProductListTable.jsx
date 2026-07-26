'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Copy, Eye, Pencil, Search, Star, Trash2 } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import DataTable from '@/components/admin/ui/DataTable'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import Toolbar from '@/components/admin/ui/Toolbar'
import AdminPagination from '@/components/admin/ui/AdminPagination'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import Toast, { ToastViewport } from '@/components/ui/Toast'
import { ConfirmDialog, SideDrawer } from '@/components/admin/ui/Overlay'
import ProductBulkBar from './ProductBulkBar'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 10

const BULK_MESSAGE = {
  delete: (n) => `${n} product${n === 1 ? '' : 's'} deleted.`,
  publish: (n) => `${n} product${n === 1 ? '' : 's'} published.`,
  draft: (n) => `${n} product${n === 1 ? '' : 's'} moved to draft.`,
  archive: (n) => `${n} product${n === 1 ? '' : 's'} archived.`,
  category: (n, v) => `Category changed to “${v}” for ${n} product${n === 1 ? '' : 's'}.`,
  brand: (n, v) => `Brand changed to “${v}” for ${n} product${n === 1 ? '' : 's'}.`,
  tags: (n, v) => `${v.length} tag${v.length === 1 ? '' : 's'} added to ${n} product${n === 1 ? '' : 's'}.`,
}

/**
 * Product list: search, filters, sorting, pagination, bulk selection and bulk
 * actions.
 *
 * `statusFilter` lets the same component back /admin/products, /products/drafts
 * and /products/archived — three routes, one table.
 *
 * Only one paginated page reaches DataTable, so a catalogue of thousands stays
 * responsive. Selection is tracked by slug rather than row index so it survives
 * sorting, filtering and paging.
 */
export default function ProductListTable({ products, categories, brands, statusFilter = null }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ status: '', category: '', brand: '', stock: '' })
  const [sort, setSort] = useState({ key: 'updated', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [toast, setToast] = useState(null)

  const scoped = useMemo(
    () => (statusFilter ? products.filter((p) => p.status === statusFilter) : products),
    [products, statusFilter],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((p) => {
      if (q && ![p.title, p.brand, p.category, p.slug].join(' ').toLowerCase().includes(q)) return false
      if (filters.status && p.status !== filters.status) return false
      if (filters.category && p.category !== filters.category) return false
      if (filters.brand && p.brand !== filters.brand) return false
      if (filters.stock === 'In stock' && p.stock <= 10) return false
      if (filters.stock === 'Low stock' && !(p.stock > 0 && p.stock <= 10)) return false
      if (filters.stock === 'Out of stock' && p.stock !== 0) return false
      return true
    })
  }, [scoped, query, filters])

  const sorted = useMemo(() => {
    const list = [...filtered]
    const { key, dir } = sort
    list.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''))
      return dir === 'asc' ? cmp : -cmp
    })
    return list
  }, [filtered, sort])

  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  function setFilter(name, value) {
    setFilters((f) => ({ ...f, [name]: value }))
    setPage(1)
  }

  function clearAll() {
    setQuery('')
    setFilters({ status: '', category: '', brand: '', stock: '' })
    setPage(1)
  }

  function applyBulk(action, payload) {
    setToast({ tone: action === 'delete' ? 'error' : 'success', text: BULK_MESSAGE[action](selected.length, payload) })
  }

  const filterDefs = [
    ...(statusFilter ? [] : [{ name: 'status', label: 'Status', value: filters.status, options: ['Published', 'Draft', 'Scheduled', 'Archived', 'Out of stock'] }]),
    { name: 'category', label: 'Category', value: filters.category, options: categories.map((c) => c.slug) },
    { name: 'brand', label: 'Brand', value: filters.brand, options: brands.map((b) => b.name) },
    { name: 'stock', label: 'Stock', value: filters.stock, options: ['In stock', 'Low stock', 'Out of stock'] },
  ]

  const hasFilters = Boolean(query) || Object.values(filters).some(Boolean)

  return (
    <>
      <AdminCard padded={false}>
        <Toolbar
          searchPlaceholder="Search by name, brand or slug…"
          searchValue={query}
          onSearchChange={(v) => { setQuery(v); setPage(1) }}
          filters={filterDefs}
          onFilterChange={setFilter}
          onOpenFilters={() => setFiltersOpen(true)}
          resultCount={filtered.length}
        />

        {rows.length === 0 ? (
          <AdminEmptyState
            icon={hasFilters ? Search : undefined}
            title={hasFilters ? 'No products match' : statusFilter ? `No ${statusFilter.toLowerCase()} products` : 'No products yet'}
            description={hasFilters
              ? 'Try a different search term or clear the filters.'
              : statusFilter === 'Draft'
                ? 'Products saved as drafts will appear here before they go live.'
                : statusFilter === 'Archived'
                  ? 'Archived products leave the catalogue but stay available for reporting.'
                  : 'Create your first product to get started.'}
            actionLabel={hasFilters ? 'Clear filters' : 'New product'}
            actionHref={hasFilters ? undefined : '/admin/products/new'}
            onAction={hasFilters ? clearAll : undefined}
          />
        ) : (
          <>
            <DataTable
              selectable
              selectedIds={selected}
              onToggleRow={(slug) => setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]))}
              onToggleAll={(next) => setSelected(next ? rows.map((r) => r.slug) : [])}
              getRowKey={(row) => row.slug}
              sort={sort}
              onSort={toggleSort}
              onDelete={setPendingDelete}
              rows={rows}
              columns={[
                {
                  key: 'title', header: 'Product', width: '26%', sortable: true,
                  render: (p) => (
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-badge border border-border">
                        <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/products/${p.slug}`} className="flex items-center gap-1.5 truncate font-semibold text-ink hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
                          <span className="truncate">{p.title}</span>
                          {p.featured ? <Star size={11} className="shrink-0 fill-gold text-gold" aria-label="Featured" /> : null}
                        </Link>
                        <span className="block truncate font-mono text-admin-xs text-muted">/{p.slug}</span>
                      </span>
                    </span>
                  ),
                },
                { key: 'category', header: 'Category', sortable: true, render: (p) => <span className="capitalize">{p.category}</span> },
                { key: 'brand', header: 'Brand', sortable: true },
                {
                  key: 'price', header: 'Price', align: 'right', sortable: true,
                  render: (p) => (
                    <span className="whitespace-nowrap tabular-nums">
                      <span className="font-semibold text-ink">{formatPrice(p.price)}</span>
                      {p.oldPrice ? <s className="ml-1.5 text-admin-xs text-muted">{formatPrice(p.oldPrice)}</s> : null}
                    </span>
                  ),
                },
                {
                  key: 'stock', header: 'Stock', align: 'right', sortable: true,
                  render: (p) => (
                    <span className={cn('font-semibold tabular-nums', p.stock === 0 ? 'text-danger' : p.stock <= 10 ? 'text-[#8A6D1F]' : 'text-ink')}>
                      {p.stock}
                    </span>
                  ),
                },
                { key: 'variants', header: 'Var.', align: 'center', sortable: true, render: (p) => <span className="tabular-nums">{p.variants}</span> },
                {
                  key: 'seoScore', header: 'SEO', align: 'center', sortable: true,
                  render: (p) => <StatusBadge status={String(p.seoScore)} tone={p.seoScore >= 85 ? 'success' : p.seoScore >= 70 ? 'warning' : 'danger'} />,
                },
                { key: 'status', header: 'Status', sortable: true, render: (p) => <StatusBadge status={p.status} /> },
                { key: 'updated', header: 'Updated', sortable: true },
                {
                  key: 'actions', header: '', align: 'right',
                  render: (p) => (
                    <span className="flex items-center justify-end gap-1">
                      <AdminButton href={`/admin/products/${p.slug}/preview`} size="xs" variant="ghost" icon={Eye} iconOnly aria-label={`Preview ${p.title}`} />
                      <AdminButton href={`/admin/products/${p.slug}`} size="xs" variant="ghost" icon={Pencil} iconOnly aria-label={`Edit ${p.title}`} />
                      <AdminButton href={`/admin/products/${p.slug}/duplicate`} size="xs" variant="ghost" icon={Copy} iconOnly aria-label={`Duplicate ${p.title}`} />
                      <AdminButton size="xs" variant="ghost" icon={Trash2} iconOnly aria-label={`Delete ${p.title}`} onClick={() => setPendingDelete(p)} className="hover:text-danger" />
                    </span>
                  ),
                },
              ]}
            />

            <AdminPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </AdminCard>

      <ProductBulkBar
        count={selected.length}
        onClear={() => setSelected([])}
        categories={categories}
        brands={brands}
        onApply={applyBulk}
      />

      <SideDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" width="sm"
        footer={<AdminButton size="sm" onClick={clearAll}>Clear all</AdminButton>}>
        <div className="flex flex-col gap-3">
          {filterDefs.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label htmlFor={`pd-${f.name}`} className="text-admin-sm font-semibold text-ink">{f.label}</label>
              <select
                id={`pd-${f.name}`}
                value={f.value}
                onChange={(e) => setFilter(f.name, e.target.value)}
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
        onConfirm={() => { setToast({ tone: 'error', text: `“${pendingDelete.title}” deleted.` }); setPendingDelete(null) }}
        title={`Delete ${pendingDelete?.title ?? 'product'}?`}
        description="This removes the product, its variants, gallery links and SEO record. Existing orders keep their snapshot. This cannot be undone."
        confirmLabel="Delete product"
      />

      {toast ? (
        <ToastViewport>
          <Toast
            tone={toast.tone}
            title={toast.tone === 'error' ? 'Deleted' : 'Done'}
            description={`${toast.text} No backend is connected in this phase, so nothing was persisted.`}
            onDismiss={() => setToast(null)}
          />
        </ToastViewport>
      ) : null}
    </>
  )
}
