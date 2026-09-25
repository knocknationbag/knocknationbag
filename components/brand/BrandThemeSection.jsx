import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import FeatureCard from '@/components/common/FeatureCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import IconTile from '@/components/ui/IconTile'
import { cn } from '@/utils/cn'

/** Small labelled frame around one example. Local to this page. */
function Panel({ title, note, children }) {
  return (
    <li className="flex flex-col rounded-card border border-border bg-surface p-5 xl:p-6">
      <h3 className="text-card-title font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-[21px] text-body">{note}</p>
      <div className="mt-5 flex-1">{children}</div>
    </li>
  )
}

const BANDS = [
  { label: 'Page', token: 'Surface', className: 'bg-surface text-ink' },
  { label: 'Section band', token: 'Surface Muted', className: 'bg-surface-muted text-ink' },
  { label: 'Footer', token: 'Ink', className: 'bg-ink text-white' },
]

/**
 * A miniature of the live theme. Every example is the real component or the
 * real token — Button, FeatureCard, Badge and IconTile are imported, not copied.
 */
export default function BrandThemeSection({ feature, featureIcon, radii }) {
  return (
    <Section background="surface">
      <SectionHeader eyebrow="THE SYSTEM" title="Website Theme" />

      <ul className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-6">
        <Panel title="Backgrounds" note="Light-first. White and muted bands alternate; ink closes the page.">
          <div className="overflow-hidden rounded-media border border-border">
            {BANDS.map((band) => (
              <div key={band.label} className={cn('flex items-center justify-between px-4 py-4', band.className)}>
                <span className="text-[14px] font-semibold">{band.label}</span>
                <span className="font-mono text-eyebrow uppercase">{band.token}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Buttons" note="Fully rounded. Gold for the primary action, ink for everything else.">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href="/collections" variant="primary" className="w-full sm:w-auto">
              Shop Collection
            </Button>
            <Button href="/collections/new-arrivals" variant="secondary" className="w-full sm:w-auto">
              Explore New Arrivals
            </Button>
            <Button href="/shop" variant="dark" size="sm" className="w-full sm:w-auto">
              Shop All
            </Button>
          </div>
        </Panel>

        <Panel title="Cards" note="White card, one hairline border, 14px radius. No shadows anywhere.">
          <FeatureCard icon={featureIcon} title={feature.title} description={feature.description} />
        </Panel>

        <Panel title="Borders" note="A single 1px hairline. On hover it darkens one step — nothing else moves.">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-media border border-border p-4">
              <p className="text-[14px] font-semibold text-ink">Default</p>
              <p className="mt-1 font-mono text-eyebrow uppercase text-body">#E2E8F0</p>
            </div>
            <div className="rounded-media border border-border-hover p-4">
              <p className="text-[14px] font-semibold text-ink">Hover</p>
              <p className="mt-1 font-mono text-eyebrow uppercase text-body">#CBD5E1</p>
            </div>
          </div>
        </Panel>

        <Panel title="Corner radius" note="Soft but architectural — four fixed steps, plus full for buttons.">
          <ul className="grid grid-cols-5 gap-2">
            {radii.map((radius) => (
              <li key={radius.name} className="flex flex-col items-center gap-2">
                <span
                  className={cn('block size-12 border border-border bg-surface-muted', radius.className)}
                  aria-hidden="true"
                />
                <span className="text-[14px] font-semibold text-ink">{radius.name}</span>
                <span className="font-mono text-eyebrow uppercase text-body">{radius.value}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Accents" note="Gold is punctuation — eyebrows, badges and icon tiles, never large surfaces.">
          <p className="font-mono text-eyebrow uppercase text-gold">Uncompromising Standard</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="new">New</Badge>
            <Badge variant="bestSeller">Best Seller</Badge>
            <Badge variant="verified">Verified</Badge>
          </div>
          <IconTile icon={featureIcon} className="mt-4" />
        </Panel>
      </ul>
    </Section>
  )
}
