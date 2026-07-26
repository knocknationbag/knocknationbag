'use client'

import Button from '@/components/ui/Button'

/**
 * Thin client wrapper over Button so ProductCard can stay a Server Component.
 * Label is "Quick Add" at every breakpoint — docs/design.md §14, deviation 4.
 * Phase 4 wires onAdd to the cart store.
 */
export default function QuickAddButton({ productId, title, label = 'Quick Add', onAdd, className }) {
  return (
    <Button
      variant="dark"
      size="sm"
      onClick={() => onAdd?.(productId)}
      aria-label={`Quick add ${title} to cart`}
      className={className}
    >
      {label}
    </Button>
  )
}
