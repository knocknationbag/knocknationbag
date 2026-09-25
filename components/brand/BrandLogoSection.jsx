import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import Logo from '@/components/common/Logo'
import { cn } from '@/utils/cn'

/**
 * The two approved lockups, rendered through the same <Logo> the header and
 * footer use — so this section can never show a different logo from the site.
 */
export default function BrandLogoSection({ logos }) {
  return (
    <Section background="surface">
      <SectionHeader eyebrow="THE MARK" title="Brand Logo" />

      <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:gap-6">
        {logos.map((logo) => (
          <figure key={logo.variant}>
            <div
              className={cn(
                'grid h-56 place-items-center rounded-card border border-border md:h-64 xl:h-80',
                logo.surface,
              )}
            >
              <Logo variant={logo.variant} size={72} href={null} />
            </div>
            <figcaption className="mt-4">
              <span className="block text-card-title font-bold text-ink">{logo.label}</span>
              <span className="mt-1.5 block text-[14px] leading-[21px] text-body">{logo.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
