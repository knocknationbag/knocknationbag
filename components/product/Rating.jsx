import { Star } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Five outline gold stars plus the numeric value, matching the reference.
 * Wrapped in one labelled element so screen readers announce the rating once
 * rather than reading five identical stars — docs/accessibility.md §5.
 */
export default function Rating({ value, showValue = true, size = 14, className }) {
  if (typeof value !== 'number') return null

  const rounded = Math.round(value)

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        role="img"
        aria-label={`Rated ${value.toFixed(1)} out of 5`}
        className="flex items-center gap-px"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={size}
            strokeWidth={2}
            aria-hidden="true"
            className={cn('text-gold', i < rounded ? 'fill-gold/15' : 'fill-transparent')}
          />
        ))}
      </span>

      {showValue ? (
        <span className="text-[13px] leading-none text-body" aria-hidden="true">
          ({value.toFixed(1)})
        </span>
      ) : null}
    </div>
  )
}
