import { cn } from '@/utils/cn'

/**
 * Surface container for every admin panel. Existing tokens, denser padding.
 *
 * `min-w-0` on the root matters: as a grid or flex child the default
 * min-width:auto lets a wide table's min-width expand the track rather than
 * scrolling inside it, which pushed the whole page sideways on mobile.
 *
 * `overflow-hidden` hard-clips wide tables to the card. Without it a table with
 * a min-width still inflated documentElement.scrollWidth even though its own
 * wrapper scrolled correctly, leaving the page horizontally scrollable. It also
 * makes inner content respect the card's rounded corners. Admin filters use
 * native <select>, which renders outside the clip, so nothing is cut off.
 */
export default function AdminCard({ title, description, actions, padded = true, className, children }) {
  return (
    <section className={cn('min-w-0 overflow-hidden rounded-media border border-border bg-surface', className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-admin-lg font-bold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-admin-sm text-body">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn(padded && 'p-4')}>{children}</div>
    </section>
  )
}
