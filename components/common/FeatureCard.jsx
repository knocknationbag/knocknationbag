import IconTile from '@/components/ui/IconTile'
import { cn } from '@/utils/cn'

/** docs/design.md §10.4 — icon tile, title, description. */
export default function FeatureCard({ icon, title, description, className }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-card border border-border bg-surface p-5 xl:p-6',
        className,
      )}
    >
      <IconTile icon={icon} />
      <h3 className="mt-5 text-[16px] font-bold leading-tight text-ink xl:mt-6">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-[21px] text-body">{description}</p>
    </div>
  )
}
