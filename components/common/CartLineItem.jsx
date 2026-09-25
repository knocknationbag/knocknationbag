'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

import QuantityStepper from '@/components/ui/QuantityStepper'
import { useCart } from '@/components/cart/CartProvider'
import { removeCartItem, setCartQuantity } from '@/lib/cart/actions'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

/**
 * One cart line. `readOnly` renders the checkout review variant.
 * Quantity and remove go to the server; the page re-renders with the server's
 * new totals, so nothing is calculated in the browser.
 */
export default function CartLineItem({ line, readOnly = false, className }) {
  const router = useRouter()
  const { setCount } = useCart()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  function run(action) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.ok) {
        setCount(result.count)
        router.refresh()
      } else setError(result.error)
    })
  }

  const href = line.slug ? `/product/${line.slug}` : null
  const maxQty = Math.max(1, Math.min(line.stock || line.quantity, 99))

  return (
    <li className={cn('flex gap-4 py-6 first:pt-0', pending && 'opacity-60', className)}>
      <span className="relative size-20 shrink-0 overflow-hidden rounded-media border border-border md:size-24">
        <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-ink">
              {href ? (
                <Link href={href} className="hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                  {line.name}
                </Link>
              ) : line.name}
            </h3>
            {line.variantLabel ? <p className="mt-1 text-[14px] text-body">{line.variantLabel}</p> : null}
            <p className="mt-1 text-[14px] text-body">
              {formatPrice(line.unitPrice)} each
              {line.onSale ? <s className="ml-2 text-muted">{formatPrice(line.regularPrice)}</s> : null}
              {line.isWholesalePrice ? <span className="ml-2 font-semibold text-verified-fg">Wholesale price</span> : null}
              {readOnly ? <span> · Qty {line.quantity}</span> : null}
            </p>
            {line.wholesaleOffer && !readOnly ? (
              <p className="mt-1 text-[13px] text-body">
                Wholesale {formatPrice(line.wholesaleOffer.price)} each from {line.wholesaleOffer.minQty} units
                ({line.wholesaleOffer.minQty - line.wholesaleOffer.productQty} more).
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-[16px] font-bold text-ink">{formatPrice(line.lineTotal)}</p>
        </div>

        {line.problem ? <p className="mt-2 text-[14px] font-semibold text-danger">{line.problem}</p> : null}
        {error ? <p role="alert" className="mt-2 text-[14px] text-danger">{error}</p> : null}

        {!readOnly ? (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            {line.available ? (
              <QuantityStepper
                key={line.quantity}
                initial={Math.min(line.quantity, 99)}
                max={maxQty}
                label={`Quantity for ${line.name}`}
                onChange={(qty) => run(() => setCartQuantity(line.id, qty))}
              />
            ) : <span />}
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => removeCartItem(line.id))}
              className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-body transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={`Remove ${line.name} from cart`}
            >
              <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
              Remove
            </button>
          </div>
        ) : null}
      </div>
    </li>
  )
}
