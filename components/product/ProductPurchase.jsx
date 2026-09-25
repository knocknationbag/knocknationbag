'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import QuantityStepper from '@/components/ui/QuantityStepper'
import PriceTag from './PriceTag'
import { useCart } from '@/components/cart/CartProvider'
import { addToCart } from '@/lib/cart/actions'
import { cn } from '@/utils/cn'

/**
 * Price, option choice, availability and quantity for the product page.
 *
 * A product with variants makes the customer choose one before buying; price
 * and stock then follow the chosen variant. The first in-stock variant is
 * preselected so the page never opens on a sold-out option.
 */
export default function ProductPurchase({ product }) {
  const { variants } = product
  const [variantId, setVariantId] = useState(
    () => (variants.find((v) => v.inStock) ?? variants[0])?.id ?? null,
  )
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState(null)
  const [pending, startTransition] = useTransition()
  const { setCount } = useCart()

  const variant = variants.find((v) => v.id === variantId) ?? null
  const price = variant?.price ?? product.price
  const oldPrice = variant ? variant.oldPrice : product.oldPrice
  const discount = variant ? variant.discount : product.discount
  const stock = variant ? variant.stock : product.stock
  const inStock = stock > 0
  const maxQty = Math.max(1, Math.min(stock, 20))

  return (
    <div>
      <div className="mt-6 flex items-end gap-4">
        <PriceTag price={price} oldPrice={oldPrice} size="lg" />
        {discount > 0 ? <Badge variant="new">Save {discount}%</Badge> : null}
      </div>

      {variants.length ? (
        <fieldset className="mt-7">
          <legend className="text-[14px] font-semibold text-ink">
            {product.optionName ?? 'Option'}: <span className="font-normal text-body">{variant?.value}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id)
                  setQuantity(1)
                  setFeedback(null)
                }}
                aria-pressed={v.id === variantId}
                className={cn(
                  'min-h-11 rounded-full border px-5 text-[14px] font-semibold transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  v.id === variantId ? 'border-ink bg-ink text-white' : 'border-border text-ink hover:border-ink',
                  !v.inStock && 'text-muted line-through decoration-1',
                )}
              >
                {v.value}
                {v.inStock ? null : <span className="sr-only"> (sold out)</span>}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p
        className={cn('mt-6 text-[14px] font-semibold', inStock ? 'text-verified-fg' : 'text-danger')}
        aria-live="polite"
      >
        {!inStock ? 'Out of stock' : stock <= 5 ? `Only ${stock} left in stock` : 'In stock'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <QuantityStepper key={variantId ?? 'single'} max={maxQty} onChange={setQuantity} />
        <Button
          variant="primary"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={!inStock || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await addToCart({ productId: product.id, variantId: variant?.id ?? null, quantity })
              if (result.ok) setCount(result.count)
              setFeedback(result)
            })
          }
        >
          {!inStock ? 'Out of Stock' : pending ? 'Adding…' : 'Add to Cart'}
        </Button>
      </div>

      <p role="status" className="mt-3 min-h-6 text-[14px]">
        {feedback?.ok ? (
          <span className="text-verified-fg">
            Added to your cart.{' '}
            <Link href="/cart" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">View cart</Link>
          </span>
        ) : feedback?.error ? (
          <span className="text-danger">{feedback.error}</span>
        ) : null}
      </p>
    </div>
  )
}
