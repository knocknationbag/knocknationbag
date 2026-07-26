import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

import QuantityStepper from '@/components/ui/QuantityStepper'
import PriceTag from '@/components/product/PriceTag'
import { cn } from '@/utils/cn'

/** One row in the cart. `readOnly` renders the checkout review variant. */
export default function CartLineItem({ item, readOnly = false, className }) {
  return (
    <li className={cn('flex gap-4 py-6 first:pt-0', className)}>
      <Link
        href={`/product/${item.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-media border border-border md:size-28 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <Image src={item.image} alt={item.imageAlt ?? ''} fill sizes="112px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-ink">
              <Link
                href={`/product/${item.slug}`}
                className="hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {item.title}
              </Link>
            </h3>
            {item.color ? <p className="mt-1 text-[14px] text-body">Colour: {item.color}</p> : null}
            {readOnly ? <p className="mt-1 text-[14px] text-body">Quantity: {item.qty}</p> : null}
          </div>

          <PriceTag price={item.price * item.qty} oldPrice={item.oldPrice ? item.oldPrice * item.qty : null} size="sm" />
        </div>

        {!readOnly ? (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <QuantityStepper initial={item.qty} label={`Quantity for ${item.title}`} />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[14px] text-body transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={`Remove ${item.title} from cart`}
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
