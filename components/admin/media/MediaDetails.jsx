'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Download, Pencil, RefreshCw, Trash2, TriangleAlert } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import CopyField from '@/components/admin/ui/CopyField'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { SideDrawer } from '@/components/admin/ui/Overlay'
import { formatBytes, renameFile } from '@/lib/admin/media'

/**
 * Image details drawer: preview, rename, replace, the four SEO text fields,
 * technical metadata, copy URL/path, download and delete.
 *
 * Where a file is used is shown prominently — it is the difference between a
 * safe delete and a broken storefront page.
 */
export default function MediaDetails({ item, open, onClose, onChange, onDelete, onReplace }) {
  // The parent keys this component on item.id, so opening a different file
  // remounts it and these initialisers run fresh. That avoids syncing props into
  // state with an effect, which causes a cascading render.
  const [draft, setDraft] = useState(item)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(() => item?.filename?.replace(/\.[^.]+$/, '') ?? '')

  if (!item || !draft) return null

  const field = (key) => ({
    value: draft[key] ?? '',
    onChange: (e) => {
      const next = { ...draft, [key]: e.target.value }
      setDraft(next)
      onChange?.(next)
    },
  })

  function commitRename() {
    const filename = renameFile(draft.filename, nameDraft)
    const next = { ...draft, filename }
    setDraft(next)
    onChange?.(next)
    setRenaming(false)
  }

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={draft.filename}
      description={`${draft.width} × ${draft.height} · ${formatBytes(draft.bytes)} · ${draft.type}`}
      width="lg"
      footer={
        <>
          <AdminButton size="sm" variant="danger" icon={Trash2} onClick={() => onDelete?.(draft)}>Delete</AdminButton>
          <AdminButton size="sm" variant="primary" onClick={onClose}>Done</AdminButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-badge border border-border bg-surface-muted">
          <Image src={draft.src} alt={draft.alt || ''} fill sizes="600px" className="object-contain" />
        </div>

        <div className="flex flex-wrap gap-2">
          <AdminButton size="xs" icon={RefreshCw} onClick={() => onReplace?.(draft)}>Replace</AdminButton>
          <AdminButton size="xs" icon={Pencil} onClick={() => setRenaming((v) => !v)}>Rename</AdminButton>
          <AdminButton size="xs" icon={Download} href={draft.src} download>Download</AdminButton>
        </div>

        {renaming ? (
          <div className="flex items-end gap-2 rounded-badge border border-border bg-surface-muted p-3">
            <AdminField
              id="media-rename" label="Filename" className="flex-1"
              hint="Extension is preserved. Spaces and symbols become hyphens."
              value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
            />
            <AdminButton size="sm" variant="primary" onClick={commitRename}>Save</AdminButton>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <CopyField label="URL" value={draft.url} />
          <CopyField label="Path" value={draft.path} />
        </div>

        <div className="rounded-badge border border-border">
          <p className="border-b border-border px-3 py-2 text-admin-sm font-semibold text-ink">Image SEO</p>
          <div className="flex flex-col gap-3 p-3">
            <AdminField
              id="media-alt" label="Alt text" required counter={{ ideal: 100, max: 125 }}
              hint="Describes the image for screen readers and image search."
              {...field('alt')}
            />
            <AdminField id="media-title" label="Title" hint="Tooltip text on hover." {...field('title')} />
            <AdminField id="media-caption" label="Caption" hint="Shown beneath the image where the template supports it." {...field('caption')} />
            <AdminField id="media-description" as="textarea" label="Description" {...field('description')} />
          </div>
        </div>

        <div className="rounded-badge border border-border">
          <p className="border-b border-border px-3 py-2 text-admin-sm font-semibold text-ink">File details</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 text-admin-sm">
            <div><dt className="text-muted">Type</dt><dd className="font-medium text-ink">{draft.type}</dd></div>
            <div><dt className="text-muted">Dimensions</dt><dd className="font-medium tabular-nums text-ink">{draft.width} × {draft.height}</dd></div>
            <div><dt className="text-muted">Size</dt><dd className="font-medium tabular-nums text-ink">{formatBytes(draft.bytes)}</dd></div>
            <div><dt className="text-muted">Folder</dt><dd className="font-medium capitalize text-ink">{draft.folder}</dd></div>
            <div><dt className="text-muted">Uploaded</dt><dd className="font-medium text-ink">{draft.uploaded}</dd></div>
            <div><dt className="text-muted">Optimised</dt><dd>{draft.optimised ? <StatusBadge status="Yes" tone="success" /> : <StatusBadge status="Pending" tone="warning" />}</dd></div>
          </dl>
        </div>

        <div className="rounded-badge border border-border">
          <p className="border-b border-border px-3 py-2 text-admin-sm font-semibold text-ink">
            Used in {draft.usedIn.length ? `(${draft.usedIn.length})` : ''}
          </p>
          {draft.usedIn.length ? (
            <ul className="divide-y divide-border">
              {draft.usedIn.map((use) => (
                <li key={`${use.module}-${use.label}`} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-admin font-medium text-ink">{use.label}</span>
                    <span className="block text-admin-xs text-muted">{use.module}</span>
                  </span>
                  <Link
                    href={use.href}
                    className="shrink-0 text-admin-sm font-semibold text-gold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-start gap-2 px-3 py-3 text-admin-sm text-body">
              <TriangleAlert size={14} className="mt-0.5 shrink-0 text-[#8A6D1F]" aria-hidden="true" />
              Not referenced anywhere. Safe to delete, and a candidate for cleanup.
            </p>
          )}
        </div>
      </div>
    </SideDrawer>
  )
}
