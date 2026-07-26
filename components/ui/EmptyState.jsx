import Button from './Button'
import { cn } from '@/utils/cn'

/** Shared empty state for cart, wishlist, search and filtered listings. */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card border border-border bg-surface px-6 py-14 text-center xl:py-20',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-6 grid size-16 place-items-center rounded-full bg-gold/10">
          <Icon size={26} strokeWidth={2} className="text-gold" aria-hidden="true" />
        </span>
      ) : null}

      <h2 className="text-[20px] font-bold text-ink xl:text-[24px]">{title}</h2>

      {description ? (
        <p className="mt-3 max-w-[420px] text-[15px] leading-[24px] text-body">{description}</p>
      ) : null}

      {actionLabel && actionHref ? (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href={actionHref} variant="primary" size="md">
            {actionLabel}
          </Button>
          {secondaryLabel && secondaryHref ? (
            <Button href={secondaryHref} variant="secondary" size="md">
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
