'use client'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminField from '@/components/admin/ui/AdminField'
import { MediaPickerField } from '@/components/admin/media/MediaPicker'
import ProductGalleryField from './ProductGalleryField'
import { PRODUCT_STATUSES, STOCK_STATUSES } from '@/constants/recordStatus'
import { slugify } from '@/lib/admin/seo'

/**
 * The product editor's field groups.
 *
 * Split out of ProductEditor so the editor stays an orchestrator — it owns the
 * state and the tab routing, these own the markup.
 */

export function BasicSection({ product, set, errors, categories = [], brands = [] }) {
  return (
    <AdminCard title="Basic information" description="What the product is called and how it is described.">
      <div className="flex flex-col gap-3.5">
        <AdminField
          id="name" label="Product name" required value={product.name} error={errors.name}
          placeholder="Apex Duffle Pro"
          onChange={(e) => {
            const name = e.target.value
            // Only track the name while the slug has never been hand-edited —
            // a slug is a URL, and silently rewriting it after publication
            // breaks every link that already points at it.
            set(product.slugLocked ? { name } : { name, slug: slugify(name) })
          }}
        />

        <div className="grid gap-3.5 md:grid-cols-2">
          <AdminField
            id="slug" label="Slug" required value={product.slug} error={errors.slug}
            hint="Lowercase, hyphen-separated. Uniqueness is enforced on save."
            placeholder="apex-duffle-pro"
            onChange={(e) => set({ slug: slugify(e.target.value), slugLocked: true })}
          />
          <AdminField
            id="sku" label="SKU" value={product.sku} error={errors.sku}
            hint="Optional, but unique when set." placeholder="KNB-APX-001"
            onChange={(e) => set({ sku: e.target.value })}
          />
        </div>

        <div className="grid gap-3.5 md:grid-cols-2">
          <AdminField id="brand" label="Brand" value={product.brand} list="brand-options"
            placeholder="Knock Nation" onChange={(e) => set({ brand: e.target.value })} />
          <datalist id="brand-options">{brands.map((b) => <option key={b} value={b} />)}</datalist>

          <AdminField id="category" label="Category" value={product.category} list="category-options"
            placeholder="Duffles" onChange={(e) => set({ category: e.target.value })} />
          <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </div>

        <AdminField
          id="short-description" as="textarea" rows={2} label="Short description"
          hint="One or two lines, used on cards and in listings."
          value={product.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })}
        />
        <AdminField
          id="description" as="textarea" rows={7} label="Full description"
          value={product.description} onChange={(e) => set({ description: e.target.value })}
        />
      </div>
    </AdminCard>
  )
}

export function PricingSection({ product, set, errors }) {
  const price = Number(product.price) || 0
  const sale = product.salePrice === '' || product.salePrice === null ? null : Number(product.salePrice)
  const cost = product.costPrice === '' || product.costPrice === null ? null : Number(product.costPrice)
  const effective = sale ?? price
  const margin = cost && effective ? Math.round(((effective - cost) / effective) * 100) : null

  // Mirrored by both the server action and a check constraint. Catching it here
  // too just means the editor says so before a round trip.
  const saleTooHigh = sale !== null && !Number.isNaN(sale) && price > 0 && sale >= price

  return (
    <AdminCard title="Pricing" description="Figures are in USD, in major units.">
      <div className="flex flex-col gap-3.5">
        <div className="grid gap-3.5 md:grid-cols-3">
          <AdminField id="price" label="Price" type="number" min="0" step="0.01" required
            value={product.price} error={errors.price} onChange={(e) => set({ price: e.target.value })} />
          <AdminField id="sale-price" label="Sale price" type="number" min="0" step="0.01"
            hint="Must be below the price." value={product.salePrice ?? ''}
            error={errors.salePrice || (saleTooHigh ? 'The sale price must be lower than the regular price.' : undefined)}
            onChange={(e) => set({ salePrice: e.target.value })} />
          <AdminField id="cost-price" label="Cost price" type="number" min="0" step="0.01"
            hint="Never shown publicly." value={product.costPrice ?? ''} error={errors.costPrice}
            onChange={(e) => set({ costPrice: e.target.value })} />
        </div>

        {margin !== null ? (
          <p className="rounded-badge bg-surface-muted px-3 py-2 text-admin-sm text-body">
            Margin at the selling price: <strong className="font-semibold text-ink">{margin}%</strong>
            {margin < 0 ? ' — you are selling below cost.' : ''}
          </p>
        ) : null}
      </div>
    </AdminCard>
  )
}

export function InventorySection({ product, set, errors }) {
  const low = Number(product.stock) <= Number(product.lowStockAlert)

  return (
    <AdminCard title="Inventory" description="Stock on hand and when to be warned about it.">
      <div className="grid gap-3.5 md:grid-cols-3">
        <AdminField id="stock" label="Stock quantity" type="number" min="0" step="1"
          value={product.stock} error={errors.stock} onChange={(e) => set({ stock: e.target.value })} />
        <AdminField id="stock-status" as="select" label="Stock status" value={product.stockStatus}
          onChange={(e) => set({ stockStatus: e.target.value })}>
          {STOCK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </AdminField>
        <AdminField id="low-stock" label="Low stock alert" type="number" min="0" step="1"
          hint={low ? 'Stock is at or below this threshold.' : 'Warn when stock reaches this level.'}
          value={product.lowStockAlert} onChange={(e) => set({ lowStockAlert: e.target.value })} />
      </div>
    </AdminCard>
  )
}

export function ImagesSection({ product, set }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminCard title="Featured image" description="The primary image, used on cards, search results and social previews.">
        <MediaPickerField id="featured-image" label="Featured image"
          value={product.featuredImage} onChange={(src) => set({ featuredImage: src })} />
      </AdminCard>

      <ProductGalleryField
        images={product.gallery}
        onChange={(gallery) => set({ gallery })}
      />
    </div>
  )
}

export function StatusSection({ product, set }) {
  return (
    <AdminCard title="Visibility">
      <AdminField id="status" as="select" label="Status" value={product.status}
        hint="Only Published products are readable by the storefront."
        onChange={(e) => set({ status: e.target.value })}>
        {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </AdminField>
    </AdminCard>
  )
}
