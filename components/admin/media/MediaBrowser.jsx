'use client'

import { useMemo, useState } from 'react'
import { Folder, ImageOff, LayoutGrid, List, Search, UploadCloud } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import { ConfirmDialog, Modal } from '@/components/admin/ui/Overlay'
import { MediaGrid, MediaList } from './MediaViews'
import MediaDetails from './MediaDetails'
import { MEDIA_SORTS, MEDIA_VIEWS, filterMedia, folderCounts, sortMedia } from '@/lib/admin/media'
import { MEDIA_FOLDERS, MEDIA_TYPES } from '@/data/media'
import { cn } from '@/utils/cn'

/**
 * The Media Library itself: folders, search, filters, views, grid/list and the
 * details drawer.
 *
 * Deliberately reusable rather than page-bound — /admin/media renders it in
 * `manage` mode, and MediaPicker renders the same component in `select` mode
 * inside a modal. One implementation, so the picker can never drift from the
 * library it is picking from.
 */
export default function MediaBrowser({
  items,
  mode = 'manage',
  selectedIds = [],
  onToggleSelect,
  onItemsChange,
  className,
}) {
  const [view, setView] = useState('all')
  const [folder, setFolder] = useState('')
  const [type, setType] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [layout, setLayout] = useState('grid')
  const [active, setActive] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [replacing, setReplacing] = useState(null)

  const selectable = mode === 'select'
  const counts = useMemo(() => folderCounts(items), [items])

  const visible = useMemo(
    () => sortMedia(filterMedia(items, { view, folder, type, query }), sort),
    [items, view, folder, type, query, sort],
  )

  const hasFilters = Boolean(query || folder || type || view !== 'all')

  function clearAll() {
    setQuery(''); setFolder(''); setType(''); setView('all')
  }

  function updateItem(next) {
    onItemsChange?.(items.map((i) => (i.id === next.id ? next : i)))
    setActive(next)
  }

  function confirmDelete() {
    onItemsChange?.(items.filter((i) => i.id !== pendingDelete.id))
    setPendingDelete(null)
    setActive(null)
  }

  return (
    <div className={cn('grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)]', className)}>
      <div className="flex flex-col gap-3">
        <AdminCard title="Views" padded={false}>
          <ul className="p-2">
            {MEDIA_VIEWS.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-pressed={view === v.id}
                  className={cn(
                    'flex h-8 w-full items-center justify-between gap-2 rounded-badge px-2 text-admin transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                    view === v.id ? 'bg-surface-muted font-semibold text-ink' : 'text-body hover:bg-surface-muted',
                  )}
                >
                  {v.label}
                  <span className="font-mono text-admin-xs text-muted">
                    {filterMedia(items, { view: v.id }).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Folders" padded={false}>
          <ul className="p-2">
            <li>
              <button
                type="button"
                onClick={() => setFolder('')}
                aria-pressed={folder === ''}
                className={cn(
                  'flex h-8 w-full items-center gap-2 rounded-badge px-2 text-admin transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                  folder === '' ? 'bg-surface-muted font-semibold text-ink' : 'text-body hover:bg-surface-muted',
                )}
              >
                <Folder size={13} aria-hidden="true" /> All
                <span className="ml-auto font-mono text-admin-xs text-muted">{items.length}</span>
              </button>
            </li>
            {MEDIA_FOLDERS.map((f) => (
              <li key={f}>
                <button
                  type="button"
                  onClick={() => setFolder(f)}
                  aria-pressed={folder === f}
                  className={cn(
                    'flex h-8 w-full items-center gap-2 rounded-badge px-2 text-admin capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                    folder === f ? 'bg-surface-muted font-semibold text-ink' : 'text-body hover:bg-surface-muted',
                  )}
                >
                  <Folder size={13} aria-hidden="true" /> {f}
                  <span className="ml-auto font-mono text-admin-xs text-muted">{counts[f] ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <AdminCard padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative min-w-[150px] flex-1 sm:max-w-[240px]">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="media-search" className="sr-only">Search media</label>
            <input
              id="media-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename or alt text…"
              className="h-8 w-full rounded-badge border border-border bg-surface pl-8 pr-2.5 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
            />
          </div>

          <label htmlFor="media-type" className="sr-only">File type</label>
          <select id="media-type" value={type} onChange={(e) => setType(e.target.value)}
            className="h-8 rounded-badge border border-border bg-surface px-2 text-admin text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
            <option value="">Type: All</option>
            {MEDIA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <label htmlFor="media-sort" className="sr-only">Sort</label>
          <select id="media-sort" value={sort} onChange={(e) => setSort(e.target.value)}
            className="h-8 rounded-badge border border-border bg-surface px-2 text-admin text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
            {MEDIA_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <p className="hidden text-admin-sm text-muted lg:block" aria-live="polite">{visible.length} files</p>

          <div className="ml-auto flex items-center gap-2">
            <div role="group" aria-label="Layout" className="flex rounded-badge border border-border p-0.5">
              {[{ id: 'grid', icon: LayoutGrid, label: 'Grid view' }, { id: 'list', icon: List, label: 'List view' }].map((l) => (
                <button
                  key={l.id} type="button" onClick={() => setLayout(l.id)}
                  aria-pressed={layout === l.id} aria-label={l.label}
                  className={cn(
                    'grid size-6 place-items-center rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                    layout === l.id ? 'bg-ink text-white' : 'text-body hover:text-ink',
                  )}
                >
                  <l.icon size={12} aria-hidden="true" />
                </button>
              ))}
            </div>

            {mode === 'manage' ? (
              <AdminButton size="sm" variant="primary" icon={UploadCloud} onClick={() => setReplacing({ upload: true })}>
                Upload
              </AdminButton>
            ) : null}
          </div>
        </div>

        {visible.length === 0 ? (
          <AdminEmptyState
            icon={hasFilters ? Search : ImageOff}
            title={hasFilters ? 'No media matches' : 'No files yet'}
            description={hasFilters ? 'Try a different search term, folder or view.' : 'Uploaded images will appear here.'}
            actionLabel={hasFilters ? 'Clear filters' : undefined}
            onAction={hasFilters ? clearAll : undefined}
          />
        ) : layout === 'grid' ? (
          <MediaGrid items={visible} onOpen={setActive} selectable={selectable} selectedIds={selectedIds} onToggleSelect={onToggleSelect} />
        ) : (
          <MediaList items={visible} onOpen={setActive} selectable={selectable} selectedIds={selectedIds} onToggleSelect={onToggleSelect} />
        )}
      </AdminCard>

      <MediaDetails
        key={active?.id}
        item={active}
        open={Boolean(active)}
        onClose={() => setActive(null)}
        onChange={updateItem}
        onDelete={setPendingDelete}
        onReplace={setReplacing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete ${pendingDelete?.filename ?? 'this file'}?`}
        description={pendingDelete?.usedIn?.length
          ? `This file is used in ${pendingDelete.usedIn.length} place${pendingDelete.usedIn.length === 1 ? '' : 's'} (${pendingDelete.usedIn.map((u) => u.label).join(', ')}). Deleting it will leave broken images on the storefront.`
          : 'This file is not referenced anywhere, so deleting it is safe.'}
        confirmLabel="Delete file"
      />

      <Modal
        open={Boolean(replacing)}
        onClose={() => setReplacing(null)}
        title={replacing?.upload ? 'Upload media' : `Replace ${replacing?.filename ?? 'file'}`}
        description={replacing?.upload
          ? 'Files are converted to WebP and resized on upload.'
          : 'The new file keeps this record’s filename, alt text and every existing reference.'}
        size="md"
        footer={<AdminButton size="sm" onClick={() => setReplacing(null)}>Close</AdminButton>}
      >
        <div className="flex flex-col items-center gap-2 rounded-badge border border-dashed border-border bg-surface-muted py-8">
          <UploadCloud size={22} className="text-muted" aria-hidden="true" />
          <p className="text-admin font-medium text-ink">Drop files here or click to browse</p>
          <p className="text-admin-xs text-muted">WebP, JPG, PNG or SVG · up to 5 MB</p>
          <p className="mt-2 text-admin-xs text-muted">Uploads are wired up when storage is connected.</p>
        </div>
      </Modal>
    </div>
  )
}
