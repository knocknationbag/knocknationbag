'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, Folder, ImageOff, Search, Trash2, Upload } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import { ConfirmDialog, SideDrawer } from '@/components/admin/ui/Overlay'
import { cn } from '@/utils/cn'

/**
 * Media manager: folders, search, usage/compression filters, and a detail drawer
 * where alt text and image SEO metadata are edited.
 *
 * "Unused" is surfaced deliberately — orphaned assets are the main source of
 * bloat in a media library, and missing alt text is an SEO and accessibility
 * defect, so both are filterable in one click.
 */
export default function MediaLibrary({ items, folders }) {
  const [folder, setFolder] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('all')
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [alt, setAlt] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((m) => {
      if (folder && m.folder !== folder) return false
      if (q && !`${m.name} ${m.alt}`.toLowerCase().includes(q)) return false
      if (view === 'unused' && m.used) return false
      if (view === 'no-alt' && m.alt) return false
      if (view === 'uncompressed' && m.compressed) return false
      return true
    })
  }, [items, folder, query, view])

  const missingAlt = items.filter((m) => !m.alt).length
  const unused = items.filter((m) => !m.used).length

  function open(item) {
    setSelected(item)
    setAlt(item.alt ?? '')
  }

  const VIEWS = [
    { id: 'all', label: `All (${items.length})` },
    { id: 'unused', label: `Unused (${unused})` },
    { id: 'no-alt', label: `Missing alt (${missingAlt})` },
    { id: 'uncompressed', label: 'Uncompressed' },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-[200px_minmax(0,1fr)]">
      <AdminCard title="Folders" padded={false}>
        <ul className="p-2">
          <li>
            <button
              type="button"
              onClick={() => setFolder('')}
              className={cn(
                'flex h-8 w-full items-center gap-2 rounded-badge px-2 text-admin transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                folder === '' ? 'bg-surface-muted font-semibold text-ink' : 'text-body hover:bg-surface-muted',
              )}
            >
              <Folder size={14} aria-hidden="true" /> All media
              <span className="ml-auto font-mono text-admin-xs text-muted">{items.length}</span>
            </button>
          </li>
          {folders.map((f) => (
            <li key={f.name}>
              <button
                type="button"
                onClick={() => setFolder(f.name)}
                className={cn(
                  'flex h-8 w-full items-center gap-2 rounded-badge px-2 text-admin capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                  folder === f.name ? 'bg-surface-muted font-semibold text-ink' : 'text-body hover:bg-surface-muted',
                )}
              >
                <Folder size={14} aria-hidden="true" /> {f.name}
                <span className="ml-auto font-mono text-admin-xs text-muted">{f.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative min-w-[160px] flex-1 sm:max-w-[240px]">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="media-search" className="sr-only">Search media</label>
            <input
              id="media-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filenames or alt text…"
              className="h-8 w-full rounded-badge border border-border bg-surface pl-8 pr-2.5 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={cn(
                  'rounded-badge px-2 py-1 text-admin-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                  view === v.id ? 'bg-ink text-white' : 'border border-border text-body hover:border-border-hover',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <AdminButton variant="primary" size="sm" icon={Upload} className="ml-auto">Upload</AdminButton>
        </div>

        {filtered.length === 0 ? (
          <AdminEmptyState icon={ImageOff} title="No media matches" description="Try a different filter or folder." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className="group w-full overflow-hidden rounded-badge border border-border text-left transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span className="relative block aspect-square bg-surface-muted">
                    <Image src={m.src} alt="" fill sizes="200px" className="object-cover" />
                    {!m.alt ? (
                      <span className="absolute left-1.5 top-1.5"><StatusBadge status="No alt" tone="danger" /></span>
                    ) : null}
                    {!m.used ? (
                      <span className="absolute right-1.5 top-1.5"><StatusBadge status="Unused" tone="warning" /></span>
                    ) : null}
                  </span>
                  <span className="block border-t border-border px-2 py-1.5">
                    <span className="block truncate text-admin-sm font-medium text-ink">{m.name}</span>
                    <span className="block truncate text-admin-xs text-muted">{m.dimensions} · {m.size}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <SideDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Media'}
        description={selected ? `${selected.dimensions} · ${selected.size}` : undefined}
        footer={
          <>
            <AdminButton variant="danger" size="sm" icon={Trash2} onClick={() => setPendingDelete(selected)}>Delete</AdminButton>
            <AdminButton variant="primary" size="sm" onClick={() => setSelected(null)}>Save</AdminButton>
          </>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-badge border border-border bg-surface-muted">
              <Image src={selected.src} alt={selected.alt || ''} fill sizes="440px" className="object-contain" />
            </div>

            <dl className="grid grid-cols-2 gap-2 text-admin-sm">
              <div><dt className="text-muted">Folder</dt><dd className="font-medium capitalize text-ink">{selected.folder}</dd></div>
              <div><dt className="text-muted">Uploaded</dt><dd className="font-medium text-ink">{selected.uploaded}</dd></div>
              <div><dt className="text-muted">Compression</dt><dd>{selected.compressed ? <StatusBadge status="Optimised" tone="success" /> : <StatusBadge status="Pending" tone="warning" />}</dd></div>
              <div><dt className="text-muted">Usage</dt><dd>{selected.used ? <StatusBadge status="In use" tone="success" /> : <StatusBadge status="Unused" tone="warning" />}</dd></div>
            </dl>

            <AdminField
              id="media-alt"
              label="Alt text"
              required
              counter={{ ideal: 100, max: 125 }}
              hint="Required for accessibility and image search."
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
            <AdminField id="media-title" label="Image title" defaultValue={selected.imageTitle ?? ''} />
            <AdminField id="media-caption" label="Caption" defaultValue={selected.imageCaption ?? ''} />
            <AdminField id="media-desc" as="textarea" label="Description" defaultValue={selected.imageDescription ?? ''} />

            {alt ? (
              <p className="inline-flex items-center gap-1.5 text-admin-sm font-medium text-verified-fg">
                <CheckCircle2 size={13} aria-hidden="true" /> Alt text set
              </p>
            ) : null}
          </div>
        ) : null}
      </SideDrawer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => { setPendingDelete(null); setSelected(null) }}
        title={`Delete ${pendingDelete?.name ?? 'this file'}?`}
        description={pendingDelete?.used
          ? 'This file is currently in use. Deleting it will leave broken images on the storefront.'
          : 'This file is not used anywhere. Deleting it is safe.'}
        confirmLabel="Delete file"
      />
    </div>
  )
}
