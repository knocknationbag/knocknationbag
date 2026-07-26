'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/utils/cn'

/** Quantity control for the PDP and cart lines. */
export default function QuantityStepper({ initial = 1, min = 1, max = 10, label = 'Quantity', onChange, className }) {
  const [qty, setQty] = useState(initial)

  function set(next) {
    const clamped = Math.min(max, Math.max(min, next))
    setQty(clamped)
    onChange?.(clamped)
  }

  const btn =
    'grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted ' +
    'disabled:opacity-40 disabled:hover:bg-transparent ' +
    'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold'

  return (
    <div className={cn('inline-flex items-center rounded-full border border-border bg-surface', className)}>
      <button type="button" onClick={() => set(qty - 1)} disabled={qty <= min} aria-label={`Decrease ${label.toLowerCase()}`} className={btn}>
        <Minus size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      <span className="min-w-10 text-center text-[15px] font-bold text-ink" aria-live="polite">
        <span className="sr-only">{label}: </span>
        {qty}
      </span>

      <button type="button" onClick={() => set(qty + 1)} disabled={qty >= max} aria-label={`Increase ${label.toLowerCase()}`} className={btn}>
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
