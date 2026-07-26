import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import FeatureProductCard from '@/components/product/FeatureProductCard'
import ProductGrid from '@/components/product/ProductGrid'

/**
 * docs/responsive.md §4.6 — 2 wide feature cards then a 3-up standard row.
 * The mobile mockup omits the wide cards entirely; they are restored here for
 * content parity (docs/design.md §14, deviation 3).
 */
export default function NewArrivalsSection({ featured, products }) {
  return (
    <Section background="muted">
      <SectionHeader eyebrow="THE CUTTING EDGE" title="New Arrivals" />

      <ul className="grid gap-3 md:grid-cols-2 md:gap-4 xl:gap-6">
        {featured.map((product) => (
          <li key={product.id}>
            <FeatureProductCard {...product} />
          </li>
        ))}
      </ul>

      <ProductGrid products={products} columns={3} className="mt-3 md:mt-4 xl:mt-6" />
    </Section>
  )
}
