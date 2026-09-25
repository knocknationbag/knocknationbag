'use client'

import { Plus, Trash2 } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import AuthMessage from '@/components/admin/auth/AuthMessage'

const newVariant = () => ({ key: `new-${Date.now()}-${Math.random()}`, value: '', sku: '', price: '', salePrice: '', stock: 0, imageUrl: '', isActive: true })

/**
 * Optional variants — one option per product (usually Colour), each with its
 * own stock and SKU, and an optional price that overrides the product's.
 *
 * Off by default: most bags are sold as one item, and they keep the simple
 * form. Switching it on hides the single stock field (the total becomes the
 * sum of the variants).
 */
export default function ProductVariantsSection({ product, set, error, images = [] }) {
  const variants = product.variants ?? []
  const keyOf = (variant) => variant.id ?? variant.key

  const update = (target, patch) =>
    set({ variants: variants.map((v) => (keyOf(v) === keyOf(target) ? { ...v, ...patch } : v)) })

  function toggle(on) {
    set({ hasVariants: on, variants: on && !variants.length ? [newVariant(), newVariant()] : variants })
  }

  return (
    <AdminCard
      title="Variants"
      description="Only if this bag comes in options — such as colours — that each have their own stock."
    >
      <div className="flex flex-col gap-4">
        <AdminToggle
          id="has-variants"
          label="This product has variants"
          hint={product.hasVariants ? 'Stock is tracked per variant.' : 'Off: the product is sold as a single item.'}
          checked={Boolean(product.hasVariants)}
          onChange={toggle}
        />

        {product.hasVariants ? (
          <>
            {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

            <AdminField
              id="option-name" label="Option name" className="max-w-[240px]"
              value={product.optionName ?? 'Colour'} placeholder="Colour"
              hint="What customers choose, e.g. Colour or Size."
              onChange={(e) => set({ optionName: e.target.value })}
            />

            <ul className="flex flex-col gap-3">
              {variants.map((variant, index) => (
                <li key={keyOf(variant)} className="rounded-media border border-border p-3">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_0.8fr_0.8fr_0.7fr_1fr_auto] xl:items-end">
                    <AdminField id={`v-value-${index}`} label={product.optionName || 'Option'} value={variant.value}
                      placeholder="Black" onChange={(e) => update(variant, { value: e.target.value })} />
                    <AdminField id={`v-sku-${index}`} label="SKU" value={variant.sku ?? ''} placeholder="Optional"
                      onChange={(e) => update(variant, { sku: e.target.value })} />
                    <AdminField id={`v-price-${index}`} label="Price" type="number" min="0" step="0.01"
                      value={variant.price ?? ''} placeholder="Same"
                      onChange={(e) => update(variant, { price: e.target.value })} />
                    <AdminField id={`v-sale-${index}`} label="Sale price" type="number" min="0" step="0.01"
                      value={variant.salePrice ?? ''} placeholder="Same"
                      onChange={(e) => update(variant, { salePrice: e.target.value })} />
                    <AdminField id={`v-stock-${index}`} label="Stock" type="number" min="0" step="1"
                      value={variant.stock} onChange={(e) => update(variant, { stock: e.target.value })} />
                    <AdminField id={`v-image-${index}`} as="select" label="Photo" value={variant.imageUrl ?? ''}
                      onChange={(e) => update(variant, { imageUrl: e.target.value })}>
                      <option value="">Main photo</option>
                      {images.map((src, i) => <option key={src} value={src}>Image {i + 1}</option>)}
                    </AdminField>
                    <AdminButton size="sm" variant="ghost" icon={Trash2} iconOnly aria-label={`Remove variant ${variant.value || index + 1}`}
                      className="hover:text-danger" onClick={() => set({ variants: variants.filter((v) => keyOf(v) !== keyOf(variant)) })} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <AdminButton size="sm" icon={Plus} onClick={() => set({ variants: [...variants, newVariant()] })}>
                Add variant
              </AdminButton>
              <p className="text-admin-xs text-muted">Leave Price blank to use the product price. Photos come from the Images tab.</p>
            </div>
          </>
        ) : null}
      </div>
    </AdminCard>
  )
}
