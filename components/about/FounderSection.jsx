import Image from 'next/image'

import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import { founder } from '@/data/content'

/**
 * Founder story on the About page.
 *
 * Sits on the muted band so the About page keeps alternating surface/muted
 * (docs/design.md §6.4) without touching any existing section.
 *
 * Two columns from lg up rather than md: at 768 an image track plus a text
 * column leaves ~290px of prose, which is too tight to read well, so it stacks
 * naturally there instead. Tracks are minmax(0, …) so the portrait can shrink
 * rather than force overflow at any width in between.
 */
export default function FounderSection() {
  return (
    <Section background="muted">
      {/* Capped and centred: at 1920 a full-width text track would be ~1300px
          against ~714px of copy, leaving the whitespace lopsided to one side.
          1200px keeps the two columns balanced and the measure readable. */}
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:gap-16">
        <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none lg:sticky lg:top-28">
          {/* 2:3 is the portrait's own ratio, so it scales without cropping */}
          <div className="relative aspect-[2/3] overflow-hidden rounded-card border border-border">
            <Image
              src={founder.portrait}
              alt={founder.portraitAlt}
              fill
              sizes="(max-width: 1023px) min(100vw - 2rem, 420px), (max-width: 1279px) 320px, 400px"
              className="object-cover"
            />
          </div>

          <figcaption className="mt-4 text-center lg:text-left">
            <p className="text-[16px] font-bold text-ink">{founder.name}</p>
            <p className="mt-1 text-[14px] text-body">{founder.role}</p>
          </figcaption>
        </div>

        <div className="max-w-[68ch]">
          <SectionHeader eyebrow={founder.eyebrow} title={founder.heading} align="left" className="mb-0" />

          <p className="mt-5 text-lead text-body md:text-lead-md xl:text-lead-xl">
            {founder.subheading}
          </p>

          {founder.story.map((paragraph, i) => (
            <p key={i} className="mt-5 text-[16px] leading-[28px] text-body">
              {paragraph}
            </p>
          ))}

          <blockquote className="mt-8 border-l-2 border-gold pl-6 xl:mt-10 xl:pl-8">
            <p className="text-[19px] font-bold leading-[32px] text-ink xl:text-[22px] xl:leading-[36px]">
              &ldquo;{founder.quote}&rdquo;
            </p>
          </blockquote>

          <p className="mt-8 font-mono text-eyebrow uppercase text-gold">
            — {founder.name}, {founder.role}
          </p>
        </div>
      </div>
    </Section>
  )
}
