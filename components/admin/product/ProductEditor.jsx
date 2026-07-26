'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import SeoPanel from '@/components/admin/seo/SeoPanel'
import { BasicSection, ImagesSection, InventorySection, PricingSection, StatusSection } from './ProductSections'
import { saveProduct } from '@/lib/actions/products'
import { autoCanonical, emptySeo, productJsonLd } from '@/lib/admin/seo'
import { cn } from '@/utils/cn'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'images', label: 'Images' },
  { id: 'seo', label: 'SEO' },
]

const blank = () => ({
  name: '', slug: '', sku: '', brand: '', category: '',
  shortDescription: '', description: '',
  price: '', salePrice: '', costPrice: '',
  stock: 0, stockStatus: 'In stock', lowStockAlert: 5,
  featuredImage: '', gallery: [],
  seo: emptySeo(), status: 'Draft', slugLocked: false,
})

/**
 * Create and edit for a product. Owns the whole record as one object and posts
 * it as a single JSON payload — see lib/actions/products.js for why.
 */
export default function ProductEditor({ product = null, categories = [], brands = [] }) {
  const router = useRouter()
  const editing = Boolean(product?.id)
  const [tab, setTab] = useState('basic')
  const [state, formAction, pending] = useActionState(saveProduct, { ok: false, error: null, fieldErrors: {} })

  const [draft, setDraft] = useState(() =>
    product ? { ...blank(), ...product, seo: { ...emptySeo(), ...product.seo }, slugLocked: true } : blank(),
  )

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }))
  const errors = state.fieldErrors ?? {}

  // A new product gets a real id only after the first save; move onto its own
  // URL so a refresh does not land back on an empty create form.
  useEffect(() => {
    if (state.ok && state.created && state.id) router.replace(`/admin/products/${state.id}`)
  }, [state, router])

  // Keep the SEO slug and the product slug as one value — they are the same URL.
  const seo = { ...draft.seo, slug: draft.slug }
  const jsonLd = productJsonLd({ ...draft, seo })

  const payload = JSON.stringify({
    ...draft,
    id: product?.id ?? null,
    seo: { ...seo, canonical: seo.canonical || '' },
  })

  const firstErrorTab = errors.name || errors.slug || errors.sku ? 'basic'
    : errors.price || errors.salePrice ? 'pricing'
      : errors.stock ? 'inventory' : null

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="payload" value={payload} />

      {state.error ? (
        <AuthMessage tone="error">
          {state.error}
          {firstErrorTab && firstErrorTab !== tab ? ` Check the ${TABS.find((t) => t.id === firstErrorTab)?.label} tab.` : ''}
        </AuthMessage>
      ) : null}
      {state.ok && !state.created ? <AuthMessage tone="success">Changes saved.</AuthMessage> : null}

      <div role="tablist" aria-label="Product sections" className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-admin font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
              tab === t.id ? 'border-gold text-ink' : 'border-transparent text-body hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <BasicSection product={draft} set={set} errors={errors} categories={categories} brands={brands} />
          <StatusSection product={draft} set={set} />
        </div>
      ) : null}

      {tab === 'pricing' ? <PricingSection product={draft} set={set} errors={errors} /> : null}
      {tab === 'inventory' ? <InventorySection product={draft} set={set} errors={errors} /> : null}
      {tab === 'images' ? <ImagesSection product={draft} set={set} /> : null}

      {tab === 'seo' ? (
        <SeoPanel
          value={{ ...seo, canonical: seo.canonical, altText: seo.altText || draft.name }}
          onChange={(next) => set({ seo: next, slug: next.slug ?? draft.slug, slugLocked: true })}
          sourceTitle={draft.name}
          jsonLd={jsonLd}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton type="submit" variant="primary" size="md" icon={Save} disabled={pending}>
          {pending ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
        </AdminButton>
        <Link
          href="/admin/products"
          className="text-admin-sm font-medium text-body underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Cancel
        </Link>
        <span className="ml-auto font-mono text-admin-xs text-muted">
          {autoCanonical(draft.slug) || 'URL appears once a name is set'}
        </span>
      </div>
    </form>
  )
}
