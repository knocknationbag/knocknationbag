import Button from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

/** Hoisted out of OrderSummary: a component defined during render remounts every pass. */
function SummaryRow({ label, value, strong = false, tone }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', strong ? 'text-ink' : tone ?? 'text-body')}>
      <dt className={cn('text-[15px]', strong && 'font-bold')}>{label}</dt>
      <dd className={cn('text-[15px]', strong ? 'text-[20px] font-bold' : 'font-medium')}>{value}</dd>
    </div>
  )
}

/**
 * Totals panel for the cart, checkout and order pages. Shows exactly what the
 * server computed (lib/checkout/pricing.js) — it does no arithmetic of its own,
 * so the figure on screen is always the figure charged.
 */
export default function OrderSummary({ totals, title = 'Order summary', ctaLabel, ctaHref, ctaDisabled = false, children, className }) {
  if (!totals) return null

  const gstLabel = totals.gstRate
    ? totals.pricesIncludeGst
      ? `Includes GST (${totals.gstRate}%)`
      : `GST (${totals.gstRate}%)`
    : null

  return (
    <aside className={cn('rounded-card border border-border bg-surface-muted p-6 xl:p-8', className)}>
      <h2 className="text-[18px] font-bold text-ink">{title}</h2>

      <dl className="mt-6 flex flex-col gap-3">
        <SummaryRow label={`Subtotal (${totals.itemCount} item${totals.itemCount === 1 ? '' : 's'})`} value={formatPrice(totals.subtotal)} />
        {totals.discount > 0 ? <SummaryRow label="Discount" value={`−${formatPrice(totals.discount)}`} tone="text-verified-fg" /> : null}
        <SummaryRow label="Shipping" value={totals.shippingFee === 0 ? 'Free' : formatPrice(totals.shippingFee)} />
        {gstLabel ? <SummaryRow label={gstLabel} value={formatPrice(totals.gstAmount)} /> : null}
        <div className="mt-3 border-t border-border pt-4">
          <SummaryRow label="Total" value={formatPrice(totals.total)} strong />
        </div>
      </dl>

      {totals.freeShippingRemaining > 0 ? (
        <p className="mt-4 rounded-media bg-surface px-3 py-2 text-[13px] text-body">
          Add <strong className="font-semibold text-ink">{formatPrice(totals.freeShippingRemaining)}</strong> more for free shipping.
        </p>
      ) : null}

      {children}

      {ctaLabel && ctaHref ? (
        <Button href={ctaDisabled ? undefined : ctaHref} variant="primary" size="md" fullWidth className="mt-6" disabled={ctaDisabled}>
          {ctaLabel}
        </Button>
      ) : null}
    </aside>
  )
}
