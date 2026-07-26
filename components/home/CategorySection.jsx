import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import CategoryCard from '@/components/common/CategoryCard'

/**
 * docs/responsive.md §4.3 — all 8 categories at every breakpoint.
 * A single list: on mobile it is a CSS snap scroller of circles, from md up it
 * becomes a 4 x 2 grid of tiles. No JS carousel, no duplicated markup, and each
 * category image is declared once.
 */
export default function CategorySection({ categories }) {
  return (
    <Section background="surface">
      <SectionHeader eyebrow="ARCHITECTURAL CURATION" title="Shop by Category" />

      <ul
        className={
          '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] ' +
          '[&::-webkit-scrollbar]:hidden ' +
          'md:mx-0 md:grid md:grid-cols-4 md:snap-none md:overflow-visible md:px-0 md:pb-0 xl:gap-6'
        }
      >
        {categories.map((category) => (
          <li key={category.id} className="w-16 shrink-0 snap-start md:w-auto md:shrink">
            <CategoryCard {...category} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
