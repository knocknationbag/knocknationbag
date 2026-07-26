'use client'

import { Plus, Trash2, Wand2 } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import DataTable from '@/components/admin/ui/DataTable'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'

/**
 * Variants. Each row carries its own SKU, price and stock.
 *
 * "Generate from attributes" builds the cartesian product of any attribute that
 * has comma-separated values, which is how a real catalogue avoids typing 12
 * colour × size rows by hand.
 */
export function VariantsSection({ form, set }) {
  const update = (id, patch) => set({ variants: form.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) })
  const remove = (id) => set({ variants: form.variants.filter((v) => v.id !== id) })

  const add = () =>
    set({
      variants: [
        ...form.variants,
        { id: `v${Date.now()}`, option: 'Colour', value: '', sku: '', price: form.price || 0, stock: 0 },
      ],
    })

  function generate() {
    const usable = form.attributes
      .filter((a) => a.key.trim() && a.value.includes(','))
      .map((a) => ({ option: a.key.trim(), values: a.value.split(',').map((v) => v.trim()).filter(Boolean) }))

    if (!usable.length) return

    let combos = [[]]
    usable.forEach((attr) => {
      combos = combos.flatMap((combo) => attr.values.map((v) => [...combo, { option: attr.option, value: v }]))
    })

    set({
      variants: combos.slice(0, 50).map((combo, i) => ({
        id: `g${i}`,
        option: combo.map((c) => c.option).join(' / '),
        value: combo.map((c) => c.value).join(' / '),
        sku: `${form.sku || 'SKU'}-${i + 1}`,
        price: form.price || 0,
        stock: 0,
      })),
    })
  }

  const canGenerate = form.attributes.some((a) => a.key.trim() && a.value.includes(','))

  return (
    <AdminCard
      title="Variants"
      description="Options that change SKU, price or stock."
      padded={false}
      actions={
        <>
          <AdminButton size="xs" icon={Wand2} onClick={generate} disabled={!canGenerate}>Generate from attributes</AdminButton>
          <AdminButton size="xs" icon={Plus} onClick={add}>Add variant</AdminButton>
        </>
      }
    >
      {form.variants.length === 0 ? (
        <AdminEmptyState
          title="No variants"
          description="This product is sold as a single SKU. Add attributes with comma-separated values, then generate variants from them."
          actionLabel="Add a variant"
          onAction={add}
        />
      ) : (
        <DataTable
          rows={form.variants}
          columns={[
            {
              key: 'option', header: 'Option',
              render: (v) => (
                <input
                  aria-label="Option name" value={v.option} onChange={(e) => update(v.id, { option: e.target.value })}
                  className="h-7 w-full rounded-badge border border-border bg-surface px-2 text-admin text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                />
              ),
            },
            {
              key: 'value', header: 'Value',
              render: (v) => (
                <input
                  aria-label="Option value" value={v.value} onChange={(e) => update(v.id, { value: e.target.value })}
                  placeholder="Graphite"
                  className="h-7 w-full rounded-badge border border-border bg-surface px-2 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                />
              ),
            },
            {
              key: 'sku', header: 'SKU',
              render: (v) => (
                <input
                  aria-label="Variant SKU" value={v.sku} onChange={(e) => update(v.id, { sku: e.target.value })}
                  className="h-7 w-full rounded-badge border border-border bg-surface px-2 font-mono text-admin-xs text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                />
              ),
            },
            {
              key: 'price', header: 'Price', align: 'right',
              render: (v) => (
                <input
                  aria-label="Variant price" type="number" min="0" value={v.price} onChange={(e) => update(v.id, { price: e.target.value })}
                  className="h-7 w-20 rounded-badge border border-border bg-surface px-2 text-right text-admin tabular-nums text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                />
              ),
            },
            {
              key: 'stock', header: 'Stock', align: 'right',
              render: (v) => (
                <input
                  aria-label="Variant stock" type="number" min="0" value={v.stock} onChange={(e) => update(v.id, { stock: e.target.value })}
                  className="h-7 w-16 rounded-badge border border-border bg-surface px-2 text-right text-admin tabular-nums text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                />
              ),
            },
            {
              key: 'actions', header: '', align: 'right',
              render: (v) => (
                <AdminButton size="xs" variant="ghost" icon={Trash2} iconOnly aria-label={`Remove variant ${v.value || v.option}`}
                  onClick={() => remove(v.id)} className="hover:text-danger" />
              ),
            },
          ]}
        />
      )}
    </AdminCard>
  )
}

/** Status + Visibility. */
export function StatusSection({ form, set, seo }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminCard title="Status">
        <div className="flex flex-col gap-3">
          <AdminField id="p-status" as="select" label="Status" value={form.status} onChange={(e) => set({ status: e.target.value })}>
            <option>Draft</option><option>Published</option><option>Scheduled</option><option>Archived</option>
          </AdminField>

          {form.status === 'Scheduled' ? (
            <AdminField id="p-publishAt" label="Publish at" type="datetime-local"
              value={form.publishAt} onChange={(e) => set({ publishAt: e.target.value })} />
          ) : null}

          <AdminToggle id="p-featured" label="Featured" hint="Include in the homepage Featured Collection."
            checked={form.featured} onChange={(v) => set({ featured: v })} />
        </div>
      </AdminCard>

      <AdminCard title="Visibility">
        <div className="flex flex-col gap-3">
          <AdminField id="p-visibility" as="select" label="Catalogue visibility" value={form.visibility} onChange={(e) => set({ visibility: e.target.value })}>
            <option>Visible everywhere</option>
            <option>Catalogue only</option>
            <option>Search only</option>
            <option>Hidden</option>
          </AdminField>
          <AdminToggle id="p-login" label="Require sign-in" hint="Only signed-in customers can view this product."
            checked={form.requiresLogin} onChange={(v) => set({ requiresLogin: v })} />
        </div>
      </AdminCard>

      <AdminCard title="SEO snapshot">
        <dl className="flex flex-col gap-1.5 text-admin-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted">Title</dt><dd className="truncate font-medium text-ink">{seo.title || '—'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Indexable</dt><dd><StatusBadge status={seo.index ? 'Index' : 'NoIndex'} /></dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Schema</dt><dd className="font-medium text-ink">{seo.schemaType}</dd></div>
        </dl>
      </AdminCard>
    </div>
  )
}
