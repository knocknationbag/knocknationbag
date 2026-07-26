import { cn } from '@/utils/cn'

/**
 * The gold-tinted circle behind FeatureCard icons. docs/design.md §10.4.
 * 40px mobile / 44px tablet / 48px desktop, 10% gold fill.
 */
export default function IconTile({ icon: Icon, className }) {
  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/10 md:size-11 xl:size-12',
        className,
      )}
    >
      <Icon className="size-5 text-gold xl:size-[22px]" strokeWidth={2} aria-hidden="true" />
    </span>
  )
}
