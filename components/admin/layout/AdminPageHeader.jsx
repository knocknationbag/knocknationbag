import { cn } from '@/utils/cn'

/** Page title row. Every admin page opens with one so headings stay consistent. */
export default function AdminPageHeader({ title, description, actions, tabs, className }) {
  return (
    <div className={cn('mb-4 md:mb-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-admin-h1 font-extrabold tracking-tight text-ink">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-[80ch] text-admin text-body">{description}</p>
          ) : null}
        </div>
        {/* min-w-0 rather than shrink-0 — see ProductForm: shrink-0 defeats flex-wrap. */}
        {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {tabs ? <div className="mt-4">{tabs}</div> : null}
    </div>
  )
}
