import { cn } from '@/utils/cn'

const VARIANTS = {
  new: 'bg-gold text-ink',
  bestSeller: 'bg-ink text-white',
  verified: 'bg-verified-bg text-verified-fg',
  neutral: 'bg-surface-muted text-body',
}

/** docs/design.md §10.2 — mono 11px, 0.1em tracking, uppercase, rounded-badge. */
export default function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-badge px-2 py-[3px]',
        'font-mono text-micro font-medium uppercase',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
