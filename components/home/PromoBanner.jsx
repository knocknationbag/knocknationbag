import Banner from '@/components/common/Banner'

/**
 * Full-bleed promo. docs/responsive.md §4.7 — 480 / 360 / 240px, one image at
 * every breakpoint, full desktop sub-copy everywhere.
 */
export default function PromoBanner() {
  return (
    <section>
      <Banner
        image="/images/banners/promo-crafted.webp"
        imageAlt="Traveller carrying a tan leather duffle along a tree-lined boulevard at golden hour"
        title="Crafted for Those Who Move."
        subtitle="A marriage of geometric structure and uncompromising utility. Engineered for active world-class travel."
        ctaLabel="Discover More"
        ctaHref="/collections"
        height="lg"
      />
    </section>
  )
}
