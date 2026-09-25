import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import StockEditor from '@/components/admin/inventory/StockEditor'
import { listProducts } from '@/lib/db/products'
import { friendlyDbError } from '@/lib/db/errors'
import { cn } from '@/utils/cn'

export const metadata = { title: 'Inventory' }

const PAGE_SIZE = 25

const VIEWS = [
  { id: 'attention', label: 'Needs attention' },
  { id: '', label: 'All products' },
  { id: 'out', label: 'Out of stock' },
]

const hrefFor = (params, changes) => {
  const search = new URLSearchParams()
  const merged = { stock: params.stock ?? 'attention', q: params.q ?? '', page: '', ...changes }
  Object.entries(merged).forEach(([key, value]) => {
    if (key === 'stock' ? value !== 'attention' : value) search.set(key, key === 'stock' && !value ? 'all' : value)
  })
  const qs = search.toString()
  return qs ? `/admin/inventory?${qs}` : '/admin/inventory'
}

/**
 * Stock at a glance, lowest first, with the number editable in place.
 * Opens on "Needs attention" (low + out of stock) because that is the list
 * someone opens this screen to act on.
 */
export default async function InventoryPage({ searchParams }) {
  const params = await searchParams
  const view = params?.stock === 'all' ? '' : params?.stock ?? 'attention'
  const page = Math.max(1, Number(params?.page) || 1)

  const { rows, total, error } = await listProducts({
    query: params?.q ?? '',
    stock: view,
    page,
    pageSize: PAGE_SIZE,
    order: 'stock',
    withVariants: true,
  })
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description="Change a number and press ✓ to save. Products with variants are stocked per variant."
      />

      {error ? <AuthMessage tone="error" className="mb-3">{friendlyDbError(error)}</AuthMessage> : null}

      <AdminCard padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
          <nav aria-label="Stock views" className="flex flex-wrap gap-1">
            {VIEWS.map((v) => (
              <Link
                key={v.label}
                href={hrefFor(params ?? {}, { stock: v.id })}
                aria-current={view === v.id ? 'page' : undefined}
                className={cn(
                  'rounded-badge px-2.5 py-1.5 text-admin-sm font-semibold transition-colors',
                  view === v.id ? 'bg-ink text-white' : 'text-body hover:bg-surface-muted hover:text-ink',
                )}
              >
                {v.label}
              </Link>
            ))}
          </nav>

          <form action="/admin/inventory" className="flex items-center gap-1.5">
            {view !== 'attention' ? <input type="hidden" name="stock" value={view || 'all'} /> : null}
            <label htmlFor="inventory-q" className="sr-only">Search products</label>
            <input
              id="inventory-q" name="q" defaultValue={params?.q ?? ''} placeholder="Search name or SKU…"
              className="h-8 w-56 rounded-badge border border-border bg-surface px-2.5 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
            />
            <AdminButton type="submit" size="sm" icon={Search} iconOnly aria-label="Search" />
          </form>
        </div>

        {rows.length === 0 ? (
          <AdminEmptyState
            title={view === 'attention' ? 'Nothing needs attention' : 'No products found'}
            description={view === 'attention' ? 'Every product is above its low-stock alert level.' : 'Try a different search.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-admin">
              <thead className="border-b border-border bg-surface-muted text-admin-xs uppercase tracking-wide text-body">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">Product</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Alert at</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">In stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border align-top last:border-0">
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2.5">
                        {p.featuredImage ? (
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-badge border border-border">
                            <Image src={p.featuredImage} alt="" fill sizes="36px" className="object-cover" />
                          </span>
                        ) : null}
                        <span className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="block truncate font-semibold text-ink hover:text-gold">
                            {p.name}
                          </Link>
                          <span className="block text-admin-xs text-muted">
                            {[p.sku, p.categoryName, p.status !== 'Published' ? p.status : null].filter(Boolean).join(' · ') || '—'}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={p.stockStatus} /></td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-body">{p.lowStockAlert}</td>
                    <td className="px-3 py-2.5">
                      {p.hasVariants ? (
                        <ul className="flex flex-col gap-1.5">
                          {p.variants.map((v) => (
                            <li key={v.id} className="flex items-center justify-end gap-2">
                              <span className="text-admin-sm text-body">{v.value}{v.isActive ? '' : ' (off)'}</span>
                              <StockEditor kind="variant" id={v.id} stock={v.stock} label={`${p.name} – ${v.value}`} />
                            </li>
                          ))}
                          <li className="pr-12 text-right text-admin-xs text-muted">Total {p.stock}</li>
                        </ul>
                      ) : (
                        <StockEditor kind="product" id={p.id} stock={p.stock} label={p.name} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 ? (
          <div className="flex items-center justify-between border-t border-border p-3 text-admin-sm text-body">
            <span>Page {page} of {pages} · {total} products</span>
            <span className="flex gap-2">
              {page > 1 ? <AdminButton size="sm" href={hrefFor(params ?? {}, { page: String(page - 1) })}>Previous</AdminButton> : null}
              {page < pages ? <AdminButton size="sm" href={hrefFor(params ?? {}, { page: String(page + 1) })}>Next</AdminButton> : null}
            </span>
          </div>
        ) : null}
      </AdminCard>
    </>
  )
}
