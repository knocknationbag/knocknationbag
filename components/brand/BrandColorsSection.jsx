import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import { cn } from '@/utils/cn'

/** The core palette (docs/design.md §3.1), painted from the live tokens. */
export default function BrandColorsSection({ colors }) {
  return (
    <Section background="muted">
      <SectionHeader eyebrow="THE PALETTE" title="Brand Colors" />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 xl:grid-cols-7 xl:gap-6">
        {colors.map((color) => (
          <li
            key={color.token}
            className="flex flex-col overflow-hidden rounded-card border border-border bg-surface"
          >
            <span
              className={cn('block h-24 border-b border-border md:h-28 xl:h-32', color.swatch)}
              aria-hidden="true"
            />
            <div className="flex flex-1 flex-col p-4 xl:p-5">
              <h3 className="text-card-title font-bold text-ink">{color.name}</h3>
              <p className="mt-2 font-mono text-eyebrow uppercase text-ink">{color.hex}</p>
              <p className="mt-2 text-[14px] leading-[21px] text-body">{color.usage}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
