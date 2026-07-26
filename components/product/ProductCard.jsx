import Image from 'next/image'
import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import PriceTag from './PriceTag'
import QuickAddButton from './QuickAddButton'
import Rating from './Rating'
import WishlistButton from './WishlistButton'
import { cn } from '@/utils/cn'

const BADGES = {
  new: { variant: 'new', label: 'New' },
  'best-seller': { variant: 'bestSeller', label: 'Best Seller' },
}

const DEFAULT_SIZES = '(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw'

/**
 * The most reused component in the project — Home, Category, Search, Wishlist,
 * Related, Recently viewed. docs/components.md#productcard.
 *
 * Stays a Server Component: only WishlistButton and QuickAddButton are clients.
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
  currency = 'USD',
  rating = null,
  badge = null,
  priority = false,
  sizes = DEFAULT_SIZES,
  className,
}) {
  const badgeConfig = badge ? BADGES[badge] : null

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-card border border-border bg-surface p-3 xl:p-4',
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

        <WishlistButton
          productId={slug}
          title={title}
          className="absolute right-[7px] top-[7px] z-20"
        />
      </div>

      {rating !== null ? <Rating value={rating} className="mt-4 xl:mt-6" /> : null}

      <h3 className="mt-3 font-bold text-ink text-card-title md:text-card-title-md xl:mt-4 xl:text-card-title-xl">
        <Link
          href={`/product/${slug}`}
          className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {title}
        </Link>
      </h3>

      {/* mt-auto pins the price row to the card bottom so a wrapped title in one
          card does not push its price out of line with its neighbours.
          flex-wrap because at 390px a 2-up card is 149px inside, which cannot fit
          the price and the "Quick Add" pill on one line — the button drops below
          rather than overflowing the viewport. */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 pt-3 xl:pt-4">
        <PriceTag price={price} oldPrice={oldPrice} currency={currency} />
        <QuickAddButton productId={slug} title={title} className="relative z-20" />
      </div>
    </article>
  )
}
