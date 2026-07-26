'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ChevronDown, ChevronUp, GripVertical, ImagePlus, LayoutGrid, List, Star, Trash2, UploadCloud,
} from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { Modal } from '@/components/admin/ui/Overlay'
import MediaPicker from '@/components/admin/media/MediaPicker'
import { cn } from '@/utils/cn'

/**
 * Product media gallery.
 *
 * Images are objects — `{ id, src, alt, title, caption, description }` — not bare
 * strings, because per-image alt text and metadata are SEO requirements, and a
 * string array has nowhere to put them.
 *
 * Reordering is native HTML5 drag-and-drop with keyboard arrow-button fallbacks,
 * so it is operable without a pointer. Index 0 is the primary image.
 */
export default function MediaGallery({ images = [], onChange, className }) {
  const [view, setView] = useState('grid')
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [editing, setEditing] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const update = (id, patch) => onChange?.(images.map((im) => (im.id === id ? { ...im, ...patch } : im)))
  const remove = (id) => onChange?.(images.filter((im) => im.id !== id))

  function reorder(from, to) {
    if (from === null || to === null || from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange?.(next)
  }

  const makePrimary = (index) => reorder(index, 0)
  const missingAlt = images.filter((im) => !im.alt?.trim()).length

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-admin-sm text-body">
            {images.length} {images.length === 1 ? 'image' : 'images'}
            {missingAlt ? (
              <span className="ml-2 font-semibold text-danger">{missingAlt} missing alt text</span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div role="group" aria-label="Gallery view" className="flex rounded-badge border border-border p-0.5">
            {[
              { id: 'grid', icon: LayoutGrid, label: 'Grid view' },
              { id: 'list', icon: List, label: 'List view' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
                aria-label={v.label}
                className={cn(
                  'grid size-6 place-items-center rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                  view === v.id ? 'bg-ink text-white' : 'text-body hover:text-ink',
                )}
              >
                <v.icon size={12} aria-hidden="true" />
              </button>
            ))}
          </div>

          <AdminButton size="xs" icon={ImagePlus} onClick={() => setPickerOpen(true)}>Add images</AdminButton>
        </div>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setPickerOpen(true) }}
        className="flex w-full flex-col items-center gap-1.5 rounded-badge border border-dashed border-border bg-surface-muted py-5 transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <UploadCloud size={18} className="text-muted" aria-hidden="true" />
        <span className="text-admin font-medium text-ink">Drop images here or click to browse</span>
        <span className="text-admin-xs text-muted">WebP, JPG or PNG · up to 5 MB · 1400 × 1400 recommended</span>
      </button>

      {images.length === 0 ? null : view === 'grid' ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {images.map((im, i) => (
            <li
              key={im.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnter={() => setOverIndex(i)}
              onDragEnd={() => { reorder(dragIndex, overIndex); setDragIndex(null); setOverIndex(null) }}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                'group relative overflow-hidden rounded-badge border bg-surface transition-colors',
                overIndex === i && dragIndex !== null ? 'border-gold' : 'border-border',
              )}
            >
              <span className="relative block aspect-square bg-surface-muted">
                <Image src={im.src} alt={im.alt || ''} fill sizes="200px" className="object-cover" />
              </span>

              {i === 0 ? (
                <span className="absolute left-1.5 top-1.5"><StatusBadge status="Primary" tone="ink" /></span>
              ) : null}
              {!im.alt?.trim() ? (
                <span className="absolute right-1.5 top-1.5"><StatusBadge status="No alt" tone="danger" /></span>
              ) : null}

              <span className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <span className="grid size-6 cursor-grab place-items-center rounded-[4px] bg-surface/95 text-body" aria-hidden="true">
                  <GripVertical size={11} />
                </span>
                {i !== 0 ? (
                  <button type="button" onClick={() => makePrimary(i)} aria-label={`Make image ${i + 1} primary`}
                    className="grid size-6 place-items-center rounded-[4px] bg-surface/95 text-body transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
                    <Star size={11} aria-hidden="true" />
                  </button>
                ) : null}
                <button type="button" onClick={() => setEditing(im)} aria-label={`Edit details for image ${i + 1}`}
                  className="ml-auto rounded-[4px] bg-surface/95 px-1.5 text-admin-xs font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
                  Details
                </button>
                <button type="button" onClick={() => remove(im.id)} aria-label={`Remove image ${i + 1}`}
                  className="grid size-6 place-items-center rounded-[4px] bg-surface/95 text-danger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
                  <Trash2 size={11} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-border rounded-badge border border-border">
          {images.map((im, i) => (
            <li key={im.id} className="flex items-center gap-2.5 p-2">
              <span className="flex shrink-0 flex-col">
                <button type="button" onClick={() => reorder(i, i - 1)} disabled={i === 0} aria-label={`Move image ${i + 1} up`}
                  className="grid size-4 place-items-center text-muted transition-colors hover:text-ink disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
                  <ChevronUp size={11} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => reorder(i, i + 1)} disabled={i === images.length - 1} aria-label={`Move image ${i + 1} down`}
                  className="grid size-4 place-items-center text-muted transition-colors hover:text-ink disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
                  <ChevronDown size={11} aria-hidden="true" />
                </button>
              </span>

              <span className="relative size-10 shrink-0 overflow-hidden rounded-[4px] border border-border">
                <Image src={im.src} alt={im.alt || ''} fill sizes="40px" className="object-cover" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-admin font-medium text-ink">{im.src.split('/').pop()}</span>
                  {i === 0 ? <StatusBadge status="Primary" tone="ink" /> : null}
                </span>
                <span className={cn('block truncate text-admin-xs', im.alt?.trim() ? 'text-muted' : 'font-semibold text-danger')}>
                  {im.alt?.trim() || 'No alt text — required for SEO and accessibility'}
                </span>
              </span>

              <AdminButton size="xs" variant="ghost" onClick={() => setEditing(im)}>Details</AdminButton>
              <AdminButton size="xs" variant="ghost" icon={Trash2} iconOnly aria-label={`Remove image ${i + 1}`}
                onClick={() => remove(im.id)} className="hover:text-danger" />
            </li>
          ))}
        </ul>
      )}

      {/* Image metadata — the SEO fields that belong per-image */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Image details"
        description="Alt text is required. Title, caption and description are optional."
        size="lg"
        footer={<AdminButton variant="primary" size="sm" onClick={() => setEditing(null)}>Done</AdminButton>}
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
            <div className="relative aspect-square overflow-hidden rounded-badge border border-border bg-surface-muted">
              <Image src={editing.src} alt={editing.alt || ''} fill sizes="200px" className="object-contain" />
            </div>

            <div className="flex flex-col gap-3">
              <AdminField
                id="gal-alt" label="Alt text" required counter={{ ideal: 100, max: 125 }}
                hint="Describe the image for screen readers and image search."
                value={editing.alt ?? ''}
                onChange={(e) => { setEditing({ ...editing, alt: e.target.value }); update(editing.id, { alt: e.target.value }) }}
              />
              <AdminField
                id="gal-title" label="Image title" value={editing.title ?? ''}
                onChange={(e) => { setEditing({ ...editing, title: e.target.value }); update(editing.id, { title: e.target.value }) }}
              />
              <AdminField
                id="gal-caption" label="Caption" value={editing.caption ?? ''}
                onChange={(e) => { setEditing({ ...editing, caption: e.target.value }); update(editing.id, { caption: e.target.value }) }}
              />
              <AdminField
                id="gal-desc" as="textarea" label="Description" value={editing.description ?? ''}
                onChange={(e) => { setEditing({ ...editing, description: e.target.value }); update(editing.id, { description: e.target.value }) }}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Images come from the Media Library, so alt text travels with them and
          nothing is referenced by a hand-typed path. */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        title="Add images to gallery"
        onSelect={(picked) => {
          const additions = picked
            .filter((m) => !images.some((im) => im.src === m.src))
            .map((m) => ({
              id: `g${m.id}`,
              src: m.src,
              alt: m.alt,
              title: m.title,
              caption: m.caption,
              description: m.description,
            }))
          onChange?.([...images, ...additions])
        }}
      />

    </div>
  )
}
