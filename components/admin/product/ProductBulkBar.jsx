'use client'

import { useState } from 'react'
import { Archive, CheckCircle2, FileText, Tags, Trash2, X } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import TagInput from '@/components/admin/ui/TagInput'
import { ConfirmDialog, Modal } from '@/components/admin/ui/Overlay'

/**
 * Bulk action bar. Appears only when rows are selected and is fixed to the
 * bottom, so the selection stays actionable while the operator scrolls a long
 * table.
 *
 * Destructive and reassigning actions route through a dialog — a bulk category
 * change across 40 products is as consequential as a delete, so it gets the same
 * confirmation treatment.
 */
export default function ProductBulkBar({ count, onClear, categories, brands, onApply }) {
  const [dialog, setDialog] = useState(null)
  const [category, setCategory] = useState(categories[0]?.slug ?? '')
  const [brand, setBrand] = useState(brands[0]?.name ?? '')
  const [tags, setTags] = useState([])

  if (count === 0) return null

  const apply = (action, payload) => {
    onApply?.(action, payload)
    setDialog(null)
    onClear?.()
  }

  const label = `${count} ${count === 1 ? 'product' : 'products'}`

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
        <div
          role="region"
          aria-label="Bulk actions"
          className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-media border border-border bg-surface px-3 py-2.5 shadow-[0_8px_28px_rgba(17,24,39,0.14)]"
        >
          <span className="inline-flex items-center gap-2 pr-1">
            <span className="grid size-5 place-items-center rounded-full bg-ink text-admin-xs font-bold text-white" aria-hidden="true">
              {count}
            </span>
            <span className="whitespace-nowrap text-admin font-semibold text-ink">{label} selected</span>
          </span>

          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

          <AdminButton size="xs" icon={CheckCircle2} onClick={() => setDialog('publish')}>Publish</AdminButton>
          <AdminButton size="xs" icon={FileText} onClick={() => setDialog('draft')}>Draft</AdminButton>
          <AdminButton size="xs" icon={Archive} onClick={() => setDialog('archive')}>Archive</AdminButton>
          <AdminButton size="xs" onClick={() => setDialog('category')}>Category</AdminButton>
          <AdminButton size="xs" onClick={() => setDialog('brand')}>Brand</AdminButton>
          <AdminButton size="xs" icon={Tags} onClick={() => setDialog('tags')}>Tags</AdminButton>
          <AdminButton size="xs" variant="danger" icon={Trash2} onClick={() => setDialog('delete')}>Delete</AdminButton>

          <AdminButton size="xs" variant="ghost" icon={X} iconOnly aria-label="Clear selection" onClick={onClear} />
        </div>
      </div>

      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={() => apply('delete')}
        title={`Delete ${label}?`}
        description="This removes every selected product, its variants, gallery links and SEO records. Existing orders keep their snapshot. This cannot be undone."
        confirmLabel={`Delete ${label}`}
      />

      <ConfirmDialog
        open={dialog === 'publish'}
        onClose={() => setDialog(null)}
        onConfirm={() => apply('publish')}
        title={`Publish ${label}?`}
        description="Selected products become visible on the storefront immediately. Any with an incomplete SEO record will publish as-is."
        confirmLabel="Publish"
        tone="primary"
      />

      <ConfirmDialog
        open={dialog === 'draft'}
        onClose={() => setDialog(null)}
        onConfirm={() => apply('draft')}
        title={`Move ${label} to draft?`}
        description="Selected products are removed from the storefront but keep all their data."
        confirmLabel="Move to draft"
        tone="primary"
      />

      <ConfirmDialog
        open={dialog === 'archive'}
        onClose={() => setDialog(null)}
        onConfirm={() => apply('archive')}
        title={`Archive ${label}?`}
        description="Archived products leave the catalogue and search but stay available for reporting. They can be restored at any time."
        confirmLabel="Archive"
        tone="primary"
      />

      <Modal
        open={dialog === 'category'}
        onClose={() => setDialog(null)}
        title={`Change category for ${label}`}
        description="Every selected product moves to this category, replacing its current one."
        size="sm"
        footer={
          <>
            <AdminButton size="sm" onClick={() => setDialog(null)}>Cancel</AdminButton>
            <AdminButton size="sm" variant="primary" onClick={() => apply('category', category)}>Apply</AdminButton>
          </>
        }
      >
        <AdminField id="bulk-category" as="select" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </AdminField>
      </Modal>

      <Modal
        open={dialog === 'brand'}
        onClose={() => setDialog(null)}
        title={`Change brand for ${label}`}
        description="Every selected product moves to this product line."
        size="sm"
        footer={
          <>
            <AdminButton size="sm" onClick={() => setDialog(null)}>Cancel</AdminButton>
            <AdminButton size="sm" variant="primary" onClick={() => apply('brand', brand)}>Apply</AdminButton>
          </>
        }
      >
        <AdminField id="bulk-brand" as="select" label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
          {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
        </AdminField>
      </Modal>

      <Modal
        open={dialog === 'tags'}
        onClose={() => setDialog(null)}
        title={`Add tags to ${label}`}
        description="Tags are added to existing ones, not replaced."
        size="sm"
        footer={
          <>
            <AdminButton size="sm" onClick={() => setDialog(null)}>Cancel</AdminButton>
            <AdminButton size="sm" variant="primary" disabled={!tags.length} onClick={() => apply('tags', tags)}>
              Add {tags.length ? `${tags.length} tag${tags.length === 1 ? '' : 's'}` : 'tags'}
            </AdminButton>
          </>
        }
      >
        <TagInput id="bulk-tags" label="Tags to add" value={tags} onChange={setTags}
          suggestions={['leather', 'sale', 'new-season', 'carry-on', 'gift']} />
      </Modal>
    </>
  )
}
