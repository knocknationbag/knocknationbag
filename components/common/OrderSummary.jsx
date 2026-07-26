import Link from 'next/link'

import Button from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

/** Hoisted out of OrderSummary: a component defined during render remounts every pass. */
function SummaryRow({ label, value, strong = false }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', strong ? 'text-ink' : 'text-body')}>
      <dt className={cn('text-[15px]', strong && 'font-bold')}>{label}</dt>
      <dd className={cn('text-[15px]', strong ? 'text-[20px] font-bold' : 'font-medium')}>{value}</dd>
    </div>
  )
}

/** Totals panel shared by the cart and every checkout step. */
export default function OrderSummary({
  items,
  shipping = 0,
  taxRate = 0.08,
  ctaLabel,
  ctaHref,
  children,
  className,
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const savings = items.reduce(
    (sum, item) => sum + (item.oldPrice ? (item.oldPrice - item.price) * item.qty : 0),
    0,
  )
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal + shipping + tax

  return (
    <aside className={cn('rounded-card border border-border bg-surface-muted p-6 xl:p-8', className)}>
      <h2 className="text-[18px] font-bold text-ink">Order summary</h2>

      <dl className="mt-6 flex flex-col gap-3">
        <SummaryRow label={`Subtotal (${items.reduce((n, i) => n + i.qty, 0)} items)`} value={formatPrice(subtotal)} />
        {savings > 0 ? (
          <div className="flex items-baseline justify-between gap-4 text-verified-fg">
            <dt className="text-[15px]">Savings</dt>
            <dd className="text-[15px] font-medium">−{formatPrice(savings)}</dd>
          </div>
        ) : null}
        <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
        <SummaryRow label="Estimated tax" value={formatPrice(tax)} />
        <div className="mt-3 border-t border-border pt-4">
          <SummaryRow label="Total" value={formatPrice(total)} strong />
        </div>
      </dl>

      {children}

      {ctaLabel && ctaHref ? (
        <Button href={ctaHref} variant="primary" size="md" fullWidth className="mt-6">
          {ctaLabel}
        </Button>
      ) : null}

      <p className="mt-4 text-center text-[13px] text-body">
        Free delivery over $150 ·{' '}
        <Link href="/returns" className="underline underline-offset-4 hover:text-gold">
          30-day returns
        </Link>
      </p>
    </aside>
  )
}
