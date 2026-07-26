'use client'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import TagInput from '@/components/admin/ui/TagInput'
import Repeater from '@/components/admin/ui/Repeater'
import ProductPicker from '../ProductPicker'
import StatusBadge from '@/components/admin/ui/StatusBadge'

const TAG_SUGGESTIONS = ['leather', 'weekender', 'carry-on', 'commuter', 'waxed-canvas', 'minimal', 'water-resistant', 'evening']

/** Categories, Brands, Collections, Tags. */
export function OrganisationSection({ form, set, categories, brands, collections }) {
  const toggleCollection = (slug) =>
    set({
      collectionSlugs: form.collectionSlugs.includes(slug)
        ? form.collectionSlugs.filter((s) => s !== slug)
        : [...form.collectionSlugs, slug],
    })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdminCard title="Classification">
        <div className="flex flex-col gap-3.5">
          <AdminField id="p-category" as="select" label="Category" required value={form.category} onChange={(e) => set({ category: e.target.value })}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </AdminField>
          <AdminField id="p-brand" as="select" label="Brand / product line" required value={form.brand} onChange={(e) => set({ brand: e.target.value })}>
            {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </AdminField>
          <TagInput
            id="p-tags" label="Tags" hint="Used for search, filtering and related-product logic."
            value={form.tags} onChange={(tags) => set({ tags })} suggestions={TAG_SUGGESTIONS}
          />
        </div>
      </AdminCard>

      <AdminCard title="Collections" description="Curated edits that include this product.">
        <ul className="flex flex-col gap-1.5">
          {collections.map((c) => {
            const on = form.collectionSlugs.includes(c.slug)
            return (
              <li key={c.slug}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-badge border border-border px-2.5 py-2 transition-colors hover:border-border-hover has-[:checked]:border-ink">
                  <input
                    type="checkbox" checked={on} onChange={() => toggleCollection(c.slug)}
                    className="size-3.5 rounded-[3px] accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                  />
                  <span className="text-admin font-medium text-ink">{c.title}</span>
                  <span className="ml-auto font-mono text-admin-xs text-muted">/{c.slug}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </AdminCard>
    </div>
  )
}

/** Specifications + Attributes — same mechanics, different intent. */
export function SpecsAttributesSection({ form, set }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdminCard title="Specifications" description="Rendered as the product page spec table.">
        <Repeater
          label="Specification rows" rows={form.specs} onChange={(specs) => set({ specs })}
          keyPlaceholder="Dimensions" valuePlaceholder="55 × 30 × 27 cm" addLabel="Add spec"
        />
      </AdminCard>

      <AdminCard title="Attributes" description="Structured facets used for filtering and variants.">
        <Repeater
          label="Attribute rows" rows={form.attributes} onChange={(attributes) => set({ attributes })}
          keyPlaceholder="Colour" valuePlaceholder="Graphite, Tan, Olive" addLabel="Add attribute"
          hint="Comma-separate multiple values. Attributes with several values can generate variants."
        />
      </AdminCard>
    </div>
  )
}

/** Shipping + Dimensions. */
export function ShippingSection({ form, set }) {
  const { length, width, height, weight } = form
  const volumetric = length && width && height ? Math.round((length * width * height) / 5000 * 100) / 100 : null

  return (
    <AdminCard title="Shipping & dimensions">
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        <AdminField id="p-weight" label="Weight (kg)" type="number" min="0" step="0.1" value={weight} onChange={(e) => set({ weight: e.target.value })} />
        <AdminField id="p-length" label="Length (cm)" type="number" min="0" value={length} onChange={(e) => set({ length: e.target.value })} />
        <AdminField id="p-width" label="Width (cm)" type="number" min="0" value={width} onChange={(e) => set({ width: e.target.value })} />
        <AdminField id="p-height" label="Height (cm)" type="number" min="0" value={height} onChange={(e) => set({ height: e.target.value })} />
      </div>

      {volumetric ? (
        <p className="mt-3">
          <StatusBadge status={`Volumetric weight ${volumetric} kg`} tone="neutral" />
        </p>
      ) : null}

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        <AdminField id="p-shipclass" as="select" label="Shipping class" value={form.shippingClass} onChange={(e) => set({ shippingClass: e.target.value })}>
          <option>Standard</option><option>Oversized</option><option>Fragile</option><option>Digital</option>
        </AdminField>
        <AdminField id="p-origin" as="select" label="Country of origin" value={form.origin} onChange={(e) => set({ origin: e.target.value })}>
          <option>Portugal</option><option>Italy</option><option>Spain</option><option>Vietnam</option>
        </AdminField>
      </div>

      <div className="mt-4 grid gap-3 rounded-badge border border-border bg-surface-muted p-3 md:grid-cols-2">
        <AdminToggle id="p-freeship" label="Free shipping" hint="Ignore calculated rates for this product."
          checked={form.freeShipping} onChange={(v) => set({ freeShipping: v })} />
        <AdminToggle id="p-requires-ship" label="Requires shipping" hint="Turn off for digital or service items."
          checked={form.requiresShipping} onChange={(v) => set({ requiresShipping: v })} />
      </div>
    </AdminCard>
  )
}

/** Related products, Cross-sell, Upsell. */
export function RelatedSection({ form, set, products, excludeSlug }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <AdminCard title="Related products" description="Shown as “You may also like”.">
        <ProductPicker
          id="p-related" label="Linked products" value={form.related} onChange={(related) => set({ related })}
          products={products} excludeSlug={excludeSlug}
          hint="Leave empty to fall back to automatic category matching."
        />
      </AdminCard>

      <AdminCard title="Cross-sell" description="Suggested in the cart alongside this product.">
        <ProductPicker
          id="p-cross" label="Cross-sell products" value={form.crossSell} onChange={(crossSell) => set({ crossSell })}
          products={products} excludeSlug={excludeSlug} max={4}
          hint="Complementary pieces — an organiser with a backpack."
        />
      </AdminCard>

      <AdminCard title="Upsell" description="Higher-value alternatives on the product page.">
        <ProductPicker
          id="p-upsell" label="Upsell products" value={form.upsell} onChange={(upsell) => set({ upsell })}
          products={products} excludeSlug={excludeSlug} max={4}
          hint="Premium versions of the same use case."
        />
      </AdminCard>
    </div>
  )
}
