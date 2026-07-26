import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import ProductGrid from '@/components/product/ProductGrid'

/**
 * Used twice on the homepage — Featured Collection and Best Sellers — and again
 * on every future listing page. They differ only in copy, data and background,
 * so they are one component (docs/components.md, anti-pattern 1).
 */
export default function ProductSection({
  eyebrow,
  title,
  products,
  columns = 4,
  background = 'surface',
  divided = false,
  className,
}) {
  return (
    <Section background={background} divided={divided} className={className}>
      <SectionHeader eyebrow={eyebrow} title={title} />
      <ProductGrid products={products} columns={columns} />
    </Section>
  )
}
