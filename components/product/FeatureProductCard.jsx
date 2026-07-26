import Image from 'next/image'
import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const BADGES = {
  new: { variant: 'new', label: 'New' },
  'best-seller': { variant: 'bestSeller', label: 'Best Seller' },
}

/**
 * The wide, image-filled New Arrivals card (868x360 on desktop) with title and
 * price laid over the photo. docs/components.md#featureproductcard.
 * A distinct component because its anatomy genuinely differs from ProductCard.
 */
export default function FeatureProductCard({
  image,
  imageAlt,
  title,
  slug,
  price,
  currency = 'USD',
  badge = null,
  priority = false,
  className,
}) {
  const badgeConfig = badge ? BADGES[badge] : null

  return (
    <article
      className={cn(
        // Fixed height per breakpoint, matching the 868x360 (desktop) and
        // 456x220 (tablet) source crops. See ProductCard for the same rationale.
        'group relative h-[180px] overflow-hidden rounded-card md:h-[220px] xl:h-[360px]',
        className,
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(max-width: 767px) 100vw, 50vw"
        priority={priority}
        className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
      />

      {/* Scrim keeps the overlaid text above 4.5:1 on any photograph */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent"
        aria-hidden="true"
      />

      {badgeConfig ? (
        <Badge variant={badgeConfig.variant} className="absolute left-4 top-4 z-10 xl:left-5 xl:top-5">
          {badgeConfig.label}
        </Badge>
      ) : null}

      <div className="absolute inset-x-4 bottom-4 z-10 xl:inset-x-6 xl:bottom-6">
        <h3 className="text-[18px] font-bold leading-tight text-white xl:text-[20px]">
          <Link
            href={`/product/${slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1 text-[15px] font-semibold text-gold xl:text-[16px]">
          {formatPrice(price, currency)}
        </p>
      </div>
    </article>
  )
}
