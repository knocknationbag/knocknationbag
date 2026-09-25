'use client'

import { useState, useTransition } from 'react'

import Button from '@/components/ui/Button'
import { useCart } from '@/components/cart/CartProvider'
import { addToCart } from '@/lib/cart/actions'

/**
 * Thin client wrapper over Button so ProductCard can stay a Server Component.
 * Label is "Quick Add" at every breakpoint — docs/design.md §14, deviation 4.
 *
 * A product with options (variants) cannot be added blind, so the button goes
 * to the product page to choose one. Sold-out products show that instead.
 */
export default function QuickAddButton({ productId, slug, title, hasVariants = false, inStock = true, className }) {
  const { setCount } = useCart()
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState(null)

  if (!inStock) {
    return (
      <Button variant="dark" size="sm" disabled className={className}>
        Sold out
      </Button>
    )
  }

  if (hasVariants) {
    return (
      <Button variant="dark" size="sm" href={`/product/${slug}`} aria-label={`Choose options for ${title}`} className={className}>
        Choose
      </Button>
    )
  }

  return (
    <Button
      variant="dark"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await addToCart({ productId, quantity: 1 })
          if (result.ok) setCount(result.count)
          setState(result.ok ? 'added' : 'error')
          setTimeout(() => setState(null), 2500)
        })
      }
      aria-label={`Quick add ${title} to cart`}
      title={state === 'error' ? 'Could not add — open the product to check availability.' : undefined}
      className={className}
    >
      {pending ? 'Adding…' : state === 'added' ? 'Added ✓' : state === 'error' ? 'Unavailable' : 'Quick Add'}
    </Button>
  )
}
