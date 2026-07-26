import Image from 'next/image'
import Link from 'next/link'

import { site } from '@/constants/site'
import { cn } from '@/utils/cn'

/**
 * Approved logo lockup — public/logo/header-footer-logo/.
 *
 * Two colourway variants of the same artwork, each intended for its own surface:
 *   header.svg — ink wordmark, for the white header, drawer and light surfaces
 *   footer.svg — white wordmark, for the #111827 footer
 * Using header.svg on the footer would render the wordmark ink-on-ink.
 *
 * The wordmark is part of the artwork now, so no live text is rendered
 * alongside it. Both files are 142 × 48.
 */
const LOGOS = {
  default: '/logo/header-footer-logo/header.svg',
  white: '/logo/header-footer-logo/footer.svg',
  mono: '/logo/header-footer-logo/header.svg',
}

const NATIVE_WIDTH = 142
const NATIVE_HEIGHT = 48
const RATIO = NATIVE_WIDTH / NATIVE_HEIGHT

/**
 * @param size  Rendered HEIGHT in px. Width is derived from the artwork's
 *              142:48 ratio, so the lockup can never be stretched.
 */
export default function Logo({ variant = 'default', size = 38, href = '/', priority = false, className }) {
  const height = size
  const width = Math.round(height * RATIO)

  // When linked, the Link carries the accessible name, so the image is silent.
  // Unlinked (the footer), the image itself must name the brand.
  const isLinked = Boolean(href)

  const image = (
    <Image
      src={LOGOS[variant]}
      alt={isLinked ? '' : site.name}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : 'eager'}
      unoptimized
      aria-hidden={isLinked ? 'true' : undefined}
    />
  )

  const classes = cn(
    // `flex`, not `inline-flex`: an inline-level box sits on the text baseline,
    // so the parent reserves descender space beneath it and the lockup lands a
    // few px above true centre in the 80px header. A block-level flex box is
    // exactly content-height, letting the parent's items-center centre it.
    'flex w-fit shrink-0 items-center',
    isLinked &&
      'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold',
    className,
  )

  if (!isLinked) {
    return <span className={classes}>{image}</span>
  }

  return (
    <Link href={href} className={classes} aria-label={site.name}>
      {image}
    </Link>
  )
}
