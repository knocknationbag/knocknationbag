import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { cn } from '@/utils/cn'

/** KPI tile. `delta` is a signed percentage; omit for a plain metric. */
export default function StatCard({ label, value, delta, hint, icon: Icon, className }) {
  const up = typeof delta === 'number' && delta >= 0
  const Trend = up ? ArrowUpRight : ArrowDownRight

  return (
    <div className={cn('rounded-media border border-border bg-surface p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-admin-sm font-medium text-body">{label}</p>
        {Icon ? (
          <span className="grid size-7 shrink-0 place-items-center rounded-badge bg-gold/10">
            <Icon size={14} strokeWidth={2} className="text-gold" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-admin-stat font-extrabold tracking-tight text-ink">{value}</p>

      <div className="mt-1.5 flex items-center gap-2">
        {typeof delta === 'number' ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-admin-sm font-semibold',
              up ? 'text-verified-fg' : 'text-danger',
            )}
          >
            <Trend size={13} strokeWidth={2.5} aria-hidden="true" />
            {up ? '+' : ''}{delta}%
          </span>
        ) : null}
        {hint ? <span className="text-admin-sm text-muted">{hint}</span> : null}
      </div>
    </div>
  )
}
