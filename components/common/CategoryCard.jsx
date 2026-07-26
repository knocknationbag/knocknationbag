import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * docs/components.md#categorycard.
 *
 * One DOM, two presentations, switched purely with CSS — so the image is
 * declared once and fetched once:
 *   mobile  — 64px circle with the label beneath (horizontal scroller)
 *   md+     — 11:8 tile, scrim, white label + gold arrow overlaid
 *
 * Rendering two variants side by side and hiding one would download every
 * category image twice; `sizes` handles the resolution switch instead.
 */
export default function CategoryCard({ image, imageAlt, title, slug, className }) {
  return (
    <Link
      href={`/category/${slug}`}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-lg',
        'md:relative md:block md:aspect-[11/8] md:gap-0 md:overflow-hidden md:rounded-card',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        className,
      )}
    >
      <span className="relative size-16 overflow-hidden rounded-full md:absolute md:inset-0 md:size-auto md:rounded-none">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 767px) 64px, (max-width: 1279px) 25vw, 25vw"
          className="object-cover md:transition-transform md:duration-[400ms] md:ease-out md:group-hover:scale-[1.03]"
        />
      </span>

      <span
        className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-t md:from-ink/75 md:via-ink/15 md:to-transparent"
        aria-hidden="true"
      />

      <span className="z-10 flex items-center gap-2 md:absolute md:bottom-3 md:left-3 xl:bottom-5 xl:left-5">
        <span className="text-[13px] font-semibold text-ink md:text-[15px] md:font-bold md:text-white xl:text-[16px]">
          {title}
        </span>
        <ArrowRight
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className="hidden text-gold transition-transform duration-200 ease-out group-hover:translate-x-1 md:block"
        />
      </span>
    </Link>
  )
}
