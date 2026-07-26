import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const SIZES = {
  sm: 'text-card-title',
  md: 'text-card-price md:text-card-price-md xl:text-card-price-xl',
  lg: 'text-card-price-xl',
}

/** docs/components.md — struck-through old price is announced, not just styled. */
export default function PriceTag({ price, oldPrice = null, currency = 'USD', size = 'md', className }) {
  return (
    <p className={cn('flex items-baseline gap-2 font-bold text-ink', SIZES[size], className)}>
      {oldPrice ? (
        <s className="text-[0.7em] font-medium text-muted" aria-label={`Was ${formatPrice(oldPrice, currency)}`}>
          {formatPrice(oldPrice, currency)}
        </s>
      ) : null}
      <span>{formatPrice(price, currency)}</span>
    </p>
  )
}
