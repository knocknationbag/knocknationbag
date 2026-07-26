import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import ReviewCard from '@/components/common/ReviewCard'

/**
 * docs/responsive.md §4.8 — 3 columns desktop, 2 tablet, 1 mobile.
 * `items-stretch` (the grid default) gives equal card heights, correcting the
 * ragged bottoms in the reference (docs/design.md §14, deviation 8).
 */
export default function ReviewSection({ reviews }) {
  return (
    <Section background="surface">
      <SectionHeader eyebrow="THE NATION SPEAKS" title="What Our Customers Say" />

      <ul className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-6">
        {reviews.map((review) => (
          <li key={review.id} className="flex">
            <ReviewCard {...review} className="w-full" />
          </li>
        ))}
      </ul>
    </Section>
  )
}
