import Image from 'next/image'

import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const HEIGHTS = {
  sm: 'h-[180px] md:h-[240px] xl:h-[320px]',
  md: 'h-[200px] md:h-[300px] xl:h-[400px]',
  lg: 'h-[240px] md:h-[360px] xl:h-[480px]',
}

/**
 * Full-bleed promotional band. docs/design.md §10.6.
 * Reused for the homepage promo and any future campaign strip.
 */
export default function Banner({
  image,
  imageAlt,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  height = 'lg',
  align = 'center',
  priority = false,
  className,
}) {
  return (
    <div className={cn('relative w-full overflow-hidden', HEIGHTS[height], className)}>
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="100vw"
        priority={priority}
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />

      <div
        className={cn(
          'relative flex h-full flex-col justify-center gap-4 px-4 md:px-12 xl:px-20',
          align === 'center' ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        <h2 className="font-extrabold text-banner text-white md:text-banner-md xl:text-banner-xl">
          {title}
        </h2>

        {subtitle ? (
          <p
            className={cn(
              'max-w-[640px] text-[15px] leading-[24px] text-gold md:text-[16px] md:leading-[26px] xl:text-lead-xl',
              align === 'center' && 'mx-auto',
            )}
          >
            {subtitle}
          </p>
        ) : null}

        {ctaLabel && ctaHref ? (
          <Button href={ctaHref} variant="primary" size="lg" className="mt-2">
            {ctaLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
