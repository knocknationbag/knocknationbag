'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import { Modal } from '@/components/admin/ui/Overlay'
import MediaBrowser from './MediaBrowser'
import { mediaItems } from '@/data/media'
import { cn } from '@/utils/cn'

/**
 * The shared way to choose an image anywhere in the dashboard.
 *
 * Products, categories, brands, collections, CMS, homepage, blog and SEO all
 * open this rather than typing a path, which means alt text always travels with
 * the image and the library stays the single source of truth.
 *
 * `multiple` switches between returning one item and an array. `onSelect`
 * receives full media records, not just paths, so callers can carry alt text.
 */
export default function MediaPicker({ open, onClose, onSelect, multiple = false, title }) {
  const [items, setItems] = useState(mediaItems)
  const [selected, setSelected] = useState([])

  // Reset the selection when the dialog opens. Adjusting state during render on
  // a prop change is React's documented alternative to a syncing effect, which
  // would trigger a cascading render.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSelected([])
  }

  function toggle(item) {
    setSelected((current) => {
      if (current.includes(item.id)) return current.filter((id) => id !== item.id)
      return multiple ? [...current, item.id] : [item.id]
    })
  }

  function confirm() {
    const chosen = selected.map((id) => items.find((i) => i.id === id)).filter(Boolean)
    onSelect?.(multiple ? chosen : chosen[0] ?? null)
    onClose?.()
  }

  const count = selected.length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (multiple ? 'Select images' : 'Select an image')}
      description={multiple ? 'Choose one or more files. Alt text travels with each image.' : 'Choose a file from the library.'}
      size="xl"
      footer={
        <>
          <span className="mr-auto text-admin-sm text-muted">
            {count ? `${count} selected` : 'Nothing selected'}
          </span>
          <AdminButton size="sm" onClick={onClose}>Cancel</AdminButton>
          <AdminButton size="sm" variant="primary" disabled={!count} onClick={confirm}>
            {multiple ? `Add ${count || ''}`.trim() : 'Use image'}
          </AdminButton>
        </>
      }
    >
      <MediaBrowser
        items={items}
        onItemsChange={setItems}
        mode="select"
        selectedIds={selected}
        onToggleSelect={toggle}
      />
    </Modal>
  )
}

/**
 * Single-image field backed by the picker. Replaces free-text path inputs — the
 * SEO panel's Open Graph and Twitter image fields use this.
 */
export function MediaPickerField({ id, label, hint, value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const item = mediaItems.find((m) => m.src === value)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span id={`${id}-label`} className="text-admin-sm font-semibold text-ink">{label}</span>

      {value ? (
        <div className="flex items-center gap-2 rounded-badge border border-border bg-surface p-2">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-[4px] border border-border bg-surface-muted">
            <Image src={value} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-admin font-medium text-ink">{item?.filename ?? value.split('/').pop()}</span>
            <span className="block truncate text-admin-xs text-muted">
              {item ? `${item.width} × ${item.height} · ${item.folder}` : 'Not in the library'}
            </span>
          </span>
          <AdminButton size="xs" onClick={() => setOpen(true)}>Change</AdminButton>
          <AdminButton size="xs" variant="ghost" icon={X} iconOnly aria-label={`Remove ${label}`} onClick={() => onChange?.('')} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-labelledby={`${id}-label`}
          className="flex items-center justify-center gap-2 rounded-badge border border-dashed border-border bg-surface-muted py-3 text-admin font-medium text-body transition-colors hover:border-border-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ImagePlus size={14} aria-hidden="true" /> Choose from Media Library
        </button>
      )}

      {hint ? <p className="text-admin-xs text-muted">{hint}</p> : null}

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(picked) => onChange?.(picked?.src ?? '')}
        title={`Select ${label.toLowerCase()}`}
      />
    </div>
  )
}
