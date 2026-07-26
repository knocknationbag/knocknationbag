'use client'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { slugify } from '@/lib/admin/seo'

/** Basic Information + Product Description. */
export function BasicInfoSection({ form, set, onTitleChange }) {
  return (
    <AdminCard title="Basic information">
      <div className="flex flex-col gap-3.5">
        <AdminField
          id="p-title" label="Product name" required placeholder="Apex Duffle Pro"
          value={form.title} onChange={(e) => onTitleChange(e.target.value)}
        />
        <div className="grid gap-3.5 md:grid-cols-2">
          <AdminField
            id="p-slug" label="URL slug" required hint="Changing this on a live product creates a 301."
            value={form.slug} onChange={(e) => set({ slug: slugify(e.target.value) })}
          />
          <AdminField id="p-subtitle" label="Subtitle" hint="Optional short line shown under the title."
            value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
        </div>
        <AdminField
          id="p-short" as="textarea" label="Short description" required
          hint="Shown on cards and used as the default meta description."
          value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })}
        />
      </div>
    </AdminCard>
  )
}

export function DescriptionSection({ form, set }) {
  return (
    <AdminCard title="Product description" description="Long-form copy shown on the product page.">
      <AdminField
        id="p-long" as="textarea" rows={10} label="Full description"
        hint="Supports plain text. A rich-text editor arrives with the CMS phase."
        value={form.longDescription} onChange={(e) => set({ longDescription: e.target.value })}
      />
      <AdminField
        id="p-features" as="textarea" rows={5} label="Feature bullets" className="mt-3.5"
        hint="One per line. Rendered as the bulleted list on the product page."
        value={form.featuresText} onChange={(e) => set({ featuresText: e.target.value })}
      />
    </AdminCard>
  )
}

/** Pricing. */
export function PricingSection({ form, set }) {
  const price = Number(form.price) || 0
  const oldPrice = Number(form.oldPrice) || 0
  const cost = Number(form.cost) || 0
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0
  const margin = price > 0 && cost > 0 ? Math.round(((price - cost) / price) * 100) : null

  return (
    <AdminCard title="Pricing" description="Stored in major units. Currency is set in Settings.">
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        <AdminField id="p-price" label="Price" required type="number" min="0" value={form.price} onChange={(e) => set({ price: e.target.value })} />
        <AdminField id="p-old" label="Compare-at" hint="Shown struck through." type="number" min="0" value={form.oldPrice} onChange={(e) => set({ oldPrice: e.target.value })} />
        <AdminField id="p-cost" label="Cost per item" hint="Never public." type="number" min="0" value={form.cost} onChange={(e) => set({ cost: e.target.value })} />
        <AdminField id="p-tax" as="select" label="Tax class" value={form.taxClass} onChange={(e) => set({ taxClass: e.target.value })}>
          <option>Standard</option><option>Reduced</option><option>Zero-rated</option>
        </AdminField>
      </div>

      {(discount > 0 || margin !== null) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {discount > 0 ? <StatusBadge status={`${discount}% discount shown on storefront`} tone="success" /> : null}
          {margin !== null ? <StatusBadge status={`${margin}% margin`} tone={margin >= 40 ? 'success' : margin >= 20 ? 'warning' : 'danger'} /> : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 rounded-badge border border-border bg-surface-muted p-3 md:grid-cols-2">
        <AdminToggle id="p-taxable" label="Charge tax" hint="Apply the selected tax class at checkout."
          checked={form.taxable} onChange={(v) => set({ taxable: v })} />
        <AdminToggle id="p-onsale" label="Mark as on sale" hint="Include in the Sale collection."
          checked={form.onSale} onChange={(v) => set({ onSale: v })} />
      </div>
    </AdminCard>
  )
}

/** Inventory. */
export function InventorySection({ form, set }) {
  const stock = Number(form.stock) || 0
  const low = Number(form.lowStockThreshold) || 0
  const state = stock === 0 ? 'Out of stock' : stock <= low ? 'Low stock' : 'In stock'

  return (
    <AdminCard title="Inventory" actions={<StatusBadge status={state} />}>
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        <AdminField id="p-sku" label="SKU" value={form.sku} onChange={(e) => set({ sku: e.target.value })} />
        <AdminField id="p-barcode" label="Barcode (GTIN, UPC, ISBN)" value={form.barcode} onChange={(e) => set({ barcode: e.target.value })} />
        <AdminField id="p-stock" label="Stock on hand" type="number" min="0" value={form.stock} onChange={(e) => set({ stock: e.target.value })} />
        <AdminField id="p-low" label="Low stock threshold" type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set({ lowStockThreshold: e.target.value })} />
        <AdminField id="p-location" as="select" label="Location" value={form.location} onChange={(e) => set({ location: e.target.value })}>
          <option>Lisbon workshop</option><option>New York warehouse</option><option>Third-party fulfilment</option>
        </AdminField>
      </div>

      <div className="mt-4 grid gap-3 rounded-badge border border-border bg-surface-muted p-3 md:grid-cols-2">
        <AdminToggle id="p-track" label="Track inventory" hint="Decrement stock automatically on each order."
          checked={form.trackInventory} onChange={(v) => set({ trackInventory: v })} />
        <AdminToggle id="p-backorder" label="Allow backorders" hint="Keep selling at zero stock."
          checked={form.backorder} onChange={(v) => set({ backorder: v })} />
      </div>
    </AdminCard>
  )
}
