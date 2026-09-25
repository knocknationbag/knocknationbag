import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import { cn } from '@/utils/cn'

/**
 * The two families loaded in app/layout.jsx, then one specimen per role set
 * with the same classes the site uses for that role.
 */
export default function BrandTypographySection({ fonts, specimens }) {
  return (
    <Section background="muted">
      <SectionHeader eyebrow="THE TYPE" title="Typography" />

      <ul className="grid gap-3 md:grid-cols-2 md:gap-4 xl:gap-6">
        {fonts.map((font) => (
          <li
            key={font.name}
            className="flex items-center gap-5 rounded-card border border-border bg-surface p-5 xl:gap-8 xl:p-8"
          >
            <span
              className={cn('text-display text-ink md:text-display-md', font.sampleClass)}
              aria-hidden="true"
            >
              Aa
            </span>
            <div>
              <p className="font-mono text-eyebrow uppercase text-gold">{font.role}</p>
              <h3 className="mt-1.5 text-card-title font-bold text-ink md:text-card-title-md xl:text-card-title-xl">
                {font.name}
              </h3>
              <p className="mt-1.5 text-[14px] leading-[21px] text-body">
                {font.usage} · Weights {font.weights}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-3 divide-y divide-border rounded-card border border-border bg-surface md:mt-4 xl:mt-6">
        {specimens.map((specimen) => (
          <div
            key={specimen.role}
            className="grid gap-3 p-5 md:grid-cols-[200px_1fr] md:items-baseline md:gap-8 xl:grid-cols-[260px_1fr] xl:p-8"
          >
            <dt>
              <span className="block text-[14px] font-semibold text-ink">{specimen.role}</span>
              <span className="mt-1 block font-mono text-eyebrow uppercase text-body">{specimen.spec}</span>
            </dt>
            <dd className={specimen.className}>{specimen.sample}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
