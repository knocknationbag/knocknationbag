import { BadgeCheck, Lock, RefreshCw, ShieldCheck, Truck } from 'lucide-react'

import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import FeatureCard from '@/components/common/FeatureCard'

const ICONS = {
  shield: ShieldCheck,
  truck: Truck,
  refresh: RefreshCw,
  lock: Lock,
  badge: BadgeCheck,
}

/**
 * Brand Promise. docs/responsive.md §4.5 — all 5 features at every breakpoint,
 * 5 columns on tablet and desktop, 2 columns on mobile.
 * Shares the surface-muted band with Featured Collection, separated by a hairline.
 */
export default function FeatureSection({ features }) {
  return (
    <Section background="muted" divided>
      <SectionHeader eyebrow="UNCOMPROMISING STANDARD" title="Our Brand Promise" />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4 xl:gap-6">
        {features.map((feature) => (
          <li key={feature.id} className="flex">
            <FeatureCard
              icon={ICONS[feature.icon]}
              title={feature.title}
              description={feature.description}
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </Section>
  )
}
