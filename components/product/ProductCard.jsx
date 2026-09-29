import Image from 'next/image'
import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import PriceTag from './PriceTag'
import QuickAddButton from './QuickAddButton'
import Rating from './Rating'
import { STORE_CURRENCY } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const BADGES = {
  new: { variant: 'new', label: 'New' },
  'best-seller': { variant: 'bestSeller', label: 'Best Seller' },
}

const DEFAULT_SIZES = '(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw'

/**
 * The most reused component in the project — Home, Category, Search, Collections,
 * Related products. docs/components.md#productcard.
 *
 * Stays a Server Component: only QuickAddButton is a client.
 * The title link is stretched over the card so the accessible name is the product
 * name, while the two controls sit above it — docs/accessibility.md §9.
 */
export default function ProductCard({
  image,
  imageAlt,
  title,
  slug,
  price,
  oldPrice = null,
  currency = STORE_CURRENCY,
  rating = null,
  badge = null,
  inStock = true,
  variants = [],
  id,
  priority = false,
  sizes = DEFAULT_SIZES,
  className,
}) {
  const badgeConfig = badge ? BADGES[badge] : null

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-card border border-border bg-surface p-2.5 md:p-3 xl:p-4',
        'transition-colors duration-200 ease-out hover:border-border-hover',
        className,
      )}
    >
      {/*
        The reference holds the image HEIGHT constant per breakpoint (160 / 220 / 280)
        and lets the width follow the column count — a 4-up image is 390x280 while a
        3-up image is 539x280. A fixed aspect ratio would make wider cards taller.
      */}
      <div className="relative h-40 overflow-hidden rounded-media md:h-[220px] xl:h-[280px]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
        />

        {badgeConfig ? (
          <Badge variant={badgeConfig.variant} className="absolute left-3 top-3 z-20">
            {badgeConfig.label}
          </Badge>
        ) : null}

        {inStock ? null : (
          <Badge variant="neutral" className="absolute right-3 top-3 z-20">Sold out</Badge>
        )}
      </div>

      {rating !== null ? <Rating value={rating} className="mt-4 xl:mt-6" /> : null}

      <h3 className="mt-2.5 font-bold text-ink text-card-title-compact md:mt-3 md:text-card-title-md xl:mt-4 xl:text-card-title-xl">
        <Link
          href={`/product/${slug}`}
          prefetch={false}
          className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {title}
        </Link>
      </h3>

      {/* mt-auto pins the price row to the card bottom so a wrapped title in one
          card does not push its price out of line with its neighbours.
          flex-wrap because at 390px a 2-up card is 149px inside, which cannot fit
          the price and the "Quick Add" pill on one line — the button drops below
          rather than overflowing the viewport. Phones get the compact type steps
          and a full-width button on its own row. */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2 md:gap-y-3 md:pt-3 xl:pt-4">
        <PriceTag price={price} oldPrice={oldPrice} currency={currency} />
        <QuickAddButton
          productId={id}
          slug={slug}
          title={title}
          hasVariants={variants.length > 0}
          inStock={inStock}
          className="relative z-20 w-full px-3 text-btn-compact md:w-auto md:px-4 md:text-btn-sm"
        />
      </div>
    </article>
  )
}
