'use client'

import { useState } from 'react'
import { Copy, Eye, Save, Trash2 } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AdminCard from '@/components/admin/ui/AdminCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ui/Overlay'
import SeoPanel from '@/components/admin/seo/SeoPanel'
import MediaGallery from './MediaGallery'
import { BasicInfoSection, DescriptionSection, InventorySection, PricingSection } from './sections/BasicSections'
import { OrganisationSection, RelatedSection, ShippingSection, SpecsAttributesSection } from './sections/OrganisationSections'
import { StatusSection, VariantsSection } from './sections/VariantsStatusSections'
import { PRODUCT_FORM_TABS, buildProductFormState, buildProductSeoState } from '@/lib/admin/productForm'
import { slugify } from '@/lib/admin/seo'
import { cn } from '@/utils/cn'

/**
 * Create / edit / duplicate product.
 *
 * Deliberately thin: it owns state and tab routing only, and each section lives
 * in its own file. The previous single-file version hit 325 lines and would have
 * roughly tripled with this phase's sections.
 *
 * Nothing is persisted — no backend in this phase.
 */
export default function ProductForm({ product = null, mode = 'create', categories, brands, collections, allProducts }) {
  const duplicate = mode === 'duplicate'
  const isEdit = mode === 'edit'

  const [tab, setTab] = useState('basic')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState(() => buildProductFormState(product, { categories, brands, duplicate }))
  const [seo, setSeo] = useState(() => buildProductSeoState(product, { duplicate }))

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  /** Title drives slug and SEO title until the author overrides them. */
  function onTitleChange(title) {
    set({ title, slug: form.slug || slugify(title) })
    setSeo((s) => ({ ...s, title: s.title || title, slug: s.slug || slugify(title) }))
  }

  const heading = duplicate
    ? `Duplicate — ${form.title || 'product'}`
    : isEdit
      ? form.title || 'Untitled product'
      : 'New product'

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-admin-h1 font-extrabold tracking-tight text-ink">{heading}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-admin text-body">
            <StatusBadge status={form.status} />
            {form.featured ? <StatusBadge status="Featured" /> : null}
            {form.visibility !== 'Visible everywhere' ? <StatusBadge status={form.visibility} tone="muted" /> : null}
            {form.slug ? <span className="font-mono text-admin-xs text-muted">/product/{form.slug}</span> : null}
          </div>
        </div>

        {/* No shrink-0 here: it would pin the cluster to its max-content width
            (~550px with six buttons) and stop flex-wrap from ever engaging,
            overflowing the page on mobile. */}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {isEdit ? (
            <>
              <AdminButton size="sm" icon={Eye} href={`/admin/products/${product.slug}/preview`}>Preview</AdminButton>
              <AdminButton size="sm" icon={Copy} href={`/admin/products/${product.slug}/duplicate`}>Duplicate</AdminButton>
              <AdminButton size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete</AdminButton>
            </>
          ) : null}
          <AdminButton href="/admin/products" size="sm">Cancel</AdminButton>
          <AdminButton size="sm" onClick={() => set({ status: 'Draft' })}>Save draft</AdminButton>
          <AdminButton size="sm" variant="primary" icon={Save} onClick={() => set({ status: 'Published' })}>
            {isEdit ? 'Save changes' : duplicate ? 'Create copy' : 'Publish'}
          </AdminButton>
        </div>
      </div>

      {duplicate ? (
        <AdminCard className="mb-4 !border-gold/40 !bg-gold/5">
          <p className="text-admin text-body">
            This is a copy. It starts as a <strong className="font-semibold text-ink">Draft</strong> and{' '}
            <strong className="font-semibold text-ink">noindex</strong> so it cannot compete with the original in
            search. Give it a unique title, slug and SEO title before publishing.
          </p>
        </AdminCard>
      ) : null}

      <div role="tablist" aria-label="Product sections" className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {PRODUCT_FORM_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-3 py-2 text-admin font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
              tab === t.id ? 'border-gold text-ink' : 'border-transparent text-body hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <BasicInfoSection form={form} set={set} onTitleChange={onTitleChange} />
          <StatusSection form={form} set={set} seo={seo} />
        </div>
      ) : null}

      {tab === 'pricing' ? <PricingSection form={form} set={set} /> : null}
      {tab === 'inventory' ? <InventorySection form={form} set={set} /> : null}
      {tab === 'organisation' ? (
        <OrganisationSection form={form} set={set} categories={categories} brands={brands} collections={collections} />
      ) : null}

      {tab === 'media' ? (
        <AdminCard title="Media gallery" description="First image is the primary. Drag to reorder.">
          <MediaGallery images={form.gallery} onChange={(gallery) => set({ gallery })} />
        </AdminCard>
      ) : null}

      {tab === 'description' ? <DescriptionSection form={form} set={set} /> : null}
      {tab === 'specs' ? <SpecsAttributesSection form={form} set={set} /> : null}
      {tab === 'variants' ? <VariantsSection form={form} set={set} /> : null}
      {tab === 'shipping' ? <ShippingSection form={form} set={set} /> : null}
      {tab === 'related' ? (
        <RelatedSection form={form} set={set} products={allProducts} excludeSlug={form.slug} />
      ) : null}
      {tab === 'seo' ? <SeoPanel value={seo} onChange={setSeo} sourceTitle={form.title} /> : null}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => setConfirmDelete(false)}
        title={`Delete ${form.title || 'this product'}?`}
        description="This removes the product, its variants, gallery links and SEO record. Existing orders keep their snapshot. This cannot be undone."
        confirmLabel="Delete product"
      />
    </>
  )
}
