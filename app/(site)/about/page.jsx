import Image from 'next/image'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import PageHeader from '@/components/common/PageHeader'
import SectionHeader from '@/components/common/SectionHeader'
import Banner from '@/components/common/Banner'
import FounderSection from '@/components/about/FounderSection'
import { aboutStats, aboutValues } from '@/data/content'

export const metadata = {
  title: 'About Us',
  description:
    'Knock Nation Bag makes premium bags for work, travel and modern life — structure first, materials that age well, and lifetime repair.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About Us | Knock Nation Bag', url: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="THE WORKSHOP"
        title="Architecture you can carry"
        description="We started in 2019 with one conviction: a bag is a structural problem before it is a fashion one. Everything since has followed from that."
        breadcrumbs={[{ label: 'About' }]}
      />

      <Container className="py-12 md:py-16 xl:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center xl:gap-16">
          <div className="relative h-[280px] overflow-hidden rounded-card md:h-[380px] xl:h-[460px]">
            <Image
              src="/images/lifestyle/ig-02-tote-flatlay.webp"
              alt="Tan leather tote, notebook and sunglasses arranged on a work surface"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="max-w-[60ch]">
            <h2 className="text-h2 font-extrabold text-ink md:text-h2-md">Why we build this way</h2>
            <p className="mt-5 text-[16px] leading-[28px] text-body">
              Most bags are designed as a shape and then made to work. We do it the other way round.
              The frame, the load path and the opening geometry are settled before anyone chooses a
              hide or a colourway — which is why our pieces hold their silhouette half-empty and
              still open one-handed when full.
            </p>
            <p className="mt-4 text-[16px] leading-[28px] text-body">
              It also means we choose materials that improve rather than merely survive.
              Vegetable-tanned leather, waxed canvas and solid brass all age into something better
              than they started. Anything that only ever looks worse never reaches the bench.
            </p>
          </div>
        </div>
      </Container>

      <Section background="muted">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 xl:gap-6">
          {aboutStats.map((stat) => (
            <li key={stat.label} className="rounded-card border border-border bg-surface p-6 text-center">
              <p className="text-[28px] font-extrabold text-ink xl:text-[34px]">{stat.value}</p>
              <p className="mt-2 text-[14px] text-body">{stat.label}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section background="surface">
        <SectionHeader eyebrow="WHAT WE HOLD TO" title="Three standards" />
        <ul className="grid gap-3 md:grid-cols-3 md:gap-4 xl:gap-6">
          {aboutValues.map((value) => (
            <li key={value.title} className="rounded-card border border-border bg-surface p-6 xl:p-8">
              <h3 className="text-[18px] font-bold text-ink">{value.title}</h3>
              <p className="mt-3 text-[15px] leading-[26px] text-body">{value.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <FounderSection />

      <Banner
        image="/images/banners/promo-crafted.webp"
        imageAlt="Traveller carrying a tan leather duffle along a tree-lined boulevard"
        title="Built to be repaired, not replaced."
        subtitle="Every piece is repairable for life at cost. A bag that returns to the workshop twice in twenty years is a success."
        ctaLabel="Read the warranty"
        ctaHref="/warranty"
        height="md"
      />
    </>
  )
}
