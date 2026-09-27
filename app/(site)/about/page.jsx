import Image from 'next/image'
import { Backpack, BadgeCheck, CalendarClock, Factory, GraduationCap, Laptop, Palette, Truck, Warehouse } from 'lucide-react'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import PageHeader from '@/components/common/PageHeader'
import SectionHeader from '@/components/common/SectionHeader'
import FeatureCard from '@/components/common/FeatureCard'
import Button from '@/components/ui/Button'
import { about } from '@/data/content'

export const metadata = {
  title: 'About Us',
  description:
    'Knock Nation has made strong, good-quality bags at fair prices in Byculla, Mumbai since 2002 — school, college, laptop and customised bags, supplied all over India.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About Us | Knock Nation Bag', url: '/about' },
}

/** Decorative icons for the client's lists, keyed by item id. */
const MAKE_ICONS = { school: Backpack, college: GraduationCap, laptop: Laptop, custom: Palette }
const WHY_ICONS = { since: CalendarClock, direct: Factory, custom: Palette, wholesale: Warehouse, india: Truck }

export default function AboutPage() {
  const { story, make, supply, why, together } = about

  return (
    <>
      <PageHeader eyebrow="ABOUT US" title={story.heading} breadcrumbs={[{ label: 'About' }]} />

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
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-4 text-[16px] leading-[28px] text-body first:mt-0">{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>

      <Section background="muted">
        <SectionHeader eyebrow="OUR WORKSHOP" title={make.heading} />
        <p className="mb-6 text-[16px] leading-[28px] text-body md:text-center">{make.intro}</p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4 xl:gap-6">
          {make.items.map((item) => (
            <li key={item.id}>
              <FeatureCard icon={MAKE_ICONS[item.id] ?? BadgeCheck} title={item.title} description={item.body} />
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-6 max-w-[70ch] text-[16px] leading-[28px] text-body md:text-center">{make.outro}</p>
      </Section>

      <Section background="surface">
        <SectionHeader eyebrow="PAN-INDIA" title={supply.heading} />
        <p className="mx-auto max-w-[70ch] text-[16px] leading-[28px] text-body md:text-center">{supply.body}</p>
      </Section>

      <Section background="muted">
        <SectionHeader eyebrow="WHY US" title={why.heading} />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-5 xl:gap-6">
          {why.items.map((item) => (
            <li key={item.id}>
              <FeatureCard icon={WHY_ICONS[item.id] ?? BadgeCheck} title={item.title} description={item.body} />
            </li>
          ))}
        </ul>
      </Section>

      <Section background="surface">
        <SectionHeader eyebrow="GET IN TOUCH" title={together.heading} />
        <div className="mx-auto flex max-w-[70ch] flex-col gap-6 md:items-center md:text-center">
          <p className="text-[16px] leading-[28px] text-body">{together.body}</p>
          <Button href="/contact" variant="primary" size="md" className="self-start md:self-center">Contact us</Button>
          <p className="font-mono text-eyebrow uppercase text-ink">{together.tagline}</p>
        </div>
      </Section>
    </>
  )
}
