'use client'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import ImageUploadField from '@/components/admin/ui/ImageUploadField'
import Repeater from '@/components/admin/ui/Repeater'
import ProductGalleryField from './ProductGalleryField'
import ProductVariantsSection from './ProductVariantsSection'
import { PRODUCT_STATUSES } from '@/constants/recordStatus'
import { slugify } from '@/lib/admin/seo'
import { formatPrice } from '@/utils/formatPrice'

/** Top-level categories followed by their subcategories, for one <select>. */
function categoryOptions(categories) {
  const top = categories.filter((c) => !c.parentId)
  return top.flatMap((parent) => [
    { id: parent.id, label: parent.name },
    ...categories.filter((c) => c.parentId === parent.id).map((child) => ({ id: child.id, label: `${parent.name} › ${child.name}` })),
  ])
}

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

        <div className="grid gap-3.5 md:grid-cols-3">
          <AdminField id="category" as="select" label="Category" value={product.categoryId ?? ''}
            hint={categories.length ? 'Pick a subcategory when one fits.' : 'Create categories first, under Categories.'}
            onChange={(e) => set({ categoryId: e.target.value })}>
            <option value="">No category</option>
            {categoryOptions(categories).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </AdminField>

          <AdminField id="brand" label="Brand" value={product.brand} list="brand-options"
            placeholder="Optional" onChange={(e) => set({ brand: e.target.value })} />
          <datalist id="brand-options">{brands.map((b) => <option key={b} value={b} />)}</datalist>

          <AdminField id="material" label="Material" value={product.material ?? ''}
            placeholder="e.g. Genuine leather" onChange={(e) => set({ material: e.target.value })} />
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

        <Repeater
          label="Product details"
          hint="Shown as a table on the product page. Dimensions, weight and capacity help customers most."
          rows={(product.specifications ?? []).map((spec, i) => ({ id: spec.id ?? `spec${i}`, key: spec.label, value: spec.value }))}
          onChange={(rows) => set({ specifications: rows.map((row) => ({ id: row.id, label: row.key, value: row.value })) })}
          keyLabel="Detail"
          valueLabel="Value"
          keyPlaceholder="Dimensions"
          valuePlaceholder="45 × 30 × 15 cm"
          addLabel="Add detail"
        />
      </div>
    </AdminCard>
  )
}

export function PricingSection({ product, set, errors }) {
  const price = Number(product.price) || 0
  const sale = product.salePrice === '' || product.salePrice === null ? null : Number(product.salePrice)
  const cost = product.costPrice === '' || product.costPrice === null || product.costPrice === undefined ? null : Number(product.costPrice)
  const effective = sale ?? price
  const margin = cost && effective ? Math.round(((effective - cost) / effective) * 100) : null

  // Mirrored by both the server action and a check constraint. Catching it here
  // too just means the editor says so before a round trip.
  const saleTooHigh = sale !== null && !Number.isNaN(sale) && price > 0 && sale >= price

  return (
    <div className="flex flex-col gap-4">
    <AdminCard title="Retail pricing" description="What every customer pays, in rupees.">
      <div className="flex flex-col gap-3.5">
        <div className="grid gap-3.5 md:grid-cols-3">
          <AdminField id="price" label="Price" type="number" min="0" step="0.01" required
            value={product.price} error={errors.price} onChange={(e) => set({ price: e.target.value })} />
          <AdminField id="sale-price" label="Sale price" type="number" min="0" step="0.01"
            hint="Must be below the price." value={product.salePrice ?? ''}
            error={errors.salePrice || (saleTooHigh ? 'The sale price must be lower than the regular price.' : undefined)}
            onChange={(e) => set({ salePrice: e.target.value })} />
          <AdminField id="cost-price" label="Cost price" type="number" min="0" step="0.01"
            hint="Private. Only used to show your margin." value={product.costPrice ?? ''} error={errors.costPrice}
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

    <AdminCard
      title="Wholesale pricing"
      description="Optional. Only customers you mark as Approved Wholesale see this price, and only when they buy at least the minimum quantity."
    >
      <div className="grid gap-3.5 md:grid-cols-2">
        <AdminField id="wholesale-price" label="Wholesale price (per unit)" type="number" min="0" step="0.01"
          value={product.wholesalePrice ?? ''} error={errors.wholesalePrice}
          hint={effective ? `Retail selling price is ${formatPrice(effective)}.` : undefined}
          onChange={(e) => set({ wholesalePrice: e.target.value })} />
        <AdminField id="wholesale-min" label="Minimum wholesale quantity" type="number" min="2" step="1"
          value={product.wholesaleMinQty ?? ''} error={errors.wholesaleMinQty}
          hint="Units per order before the wholesale price applies."
          onChange={(e) => set({ wholesaleMinQty: e.target.value })} />
      </div>
    </AdminCard>
    </div>
  )
}

export function InventorySection({ product, set, errors, images = [] }) {
  const variantTotal = (product.variants ?? []).filter((v) => v.isActive !== false).reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
  const stock = product.hasVariants ? variantTotal : Number(product.stock) || 0
  const status = stock <= 0 ? 'Out of stock' : stock <= Number(product.lowStockAlert) ? 'Low stock' : 'In stock'

  return (
    <div className="flex flex-col gap-4">
      <AdminCard title="Stock" description="Units you have ready to sell. Status updates automatically.">
        <div className="grid gap-3.5 md:grid-cols-3">
          {product.hasVariants ? (
            <AdminField id="stock" label="Total stock" value={variantTotal} disabled
              hint="Sum of the variants below." onChange={() => {}} />
          ) : (
            <AdminField id="stock" label="Stock quantity" type="number" min="0" step="1"
              value={product.stock} error={errors.stock} onChange={(e) => set({ stock: e.target.value })} />
          )}
          <AdminField id="low-stock" label="Low stock alert" type="number" min="0" step="1"
            hint="Flag as low stock at or below this number."
            value={product.lowStockAlert} onChange={(e) => set({ lowStockAlert: e.target.value })} />
          <AdminField id="stock-status" label="Status" value={status} disabled onChange={() => {}} />
        </div>
      </AdminCard>

      <ProductVariantsSection product={product} set={set} error={errors.variants} images={images} />
    </div>
  )
}

export function ImagesSection({ product, set }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminCard title="Featured image" description="The main photo, used on product cards, search results and social previews.">
        <ImageUploadField folder="products"
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
        hint="Only Published products appear in the shop."
        onChange={(e) => set({ status: e.target.value })}>
        {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </AdminField>
      <AdminToggle id="featured" className="mt-4" label="Featured"
        hint="Shown in the homepage Featured section."
        checked={Boolean(product.isFeatured)} onChange={(isFeatured) => set({ isFeatured })} />
    </AdminCard>
  )
}
