import { Inbox } from 'lucide-react'

import AdminButton from './AdminButton'
import { cn } from '@/utils/cn'

/** Compact empty state for admin panels and tables. */
export default function AdminEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <span className="mb-3 grid size-10 place-items-center rounded-full bg-gold/10">
        <Icon size={18} strokeWidth={2} className="text-gold" aria-hidden="true" />
      </span>
      <h3 className="text-admin-lg font-bold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-[46ch] text-admin-sm leading-[19px] text-body">{description}</p>
      ) : null}
      {actionLabel ? (
        <AdminButton variant="primary" size="sm" href={actionHref} onClick={onAction} className="mt-4">
          {actionLabel}
        </AdminButton>
      ) : null}
    </div>
  )
}

/** Table-shaped shimmer for loading lists. */
export function AdminTableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="p-4" aria-hidden="true">
      <div className="animate-pulse space-y-2">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-3">
            {Array.from({ length: cols }, (_, c) => (
              <div
                key={c}
                className="h-7 flex-1 rounded-badge bg-border/70"
                style={{ maxWidth: c === 0 ? '28%' : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
