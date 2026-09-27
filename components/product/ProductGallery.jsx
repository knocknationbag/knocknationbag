'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { useVariantSelection } from './VariantSelection'
import { cn } from '@/utils/cn'

/**
 * Main image plus thumbnails. Thumbnails are a real tablist for keyboard use.
 *
 * Mobile: a single-row strip under the image that scrolls sideways natively
 * (swipe). flex-nowrap + shrink-0 keep every thumbnail the same size;
 * min-w-0 lets the strip be narrower than its content, so the strip scrolls
 * rather than widening the page. overscroll-x-contain stops a swipe at either
 * end from carrying on to the page. touch-pan-x + touch-pan-y +
 * touch-pinch-zoom allow sideways swiping without blocking vertical page
 * scrolling or pinch-zoom.
 * Scrollbar hidden visually only — scrolling stays enabled.
 *
 * md and up: unchanged — an 80px vertical rail to the left of the image.
 *
 * The main image also takes a finger swipe: left = next, right = previous
 * (stopping at the ends). touch-pan-y hands vertical gestures to the browser,
 * so the page still scrolls normally — a vertical drag cancels the pointer
 * and never reaches the handler; only a clearly horizontal touch swipe of
 * 40px or more changes the photo. Mouse and pen input are left alone.
 */
const SWIPE_MIN_PX = 40

function GalleryView({ images, alt, badge }) {
  const [active, setActive] = useState(0)
  const swipe = useRef(null)
  const strip = useRef(null)

  // Keep the active thumbnail in view in the mobile strip (e.g. after a
  // swipe). Scrolls the strip only, never the page; no-op for the rail.
  useEffect(() => {
    const el = strip.current
    const thumb = el?.children[active]
    if (!el || !thumb || el.scrollWidth <= el.clientWidth) return
    const box = el.getBoundingClientRect()
    const t = thumb.getBoundingClientRect()
    if (t.left < box.left) el.scrollBy({ left: t.left - box.left - 12 })
    else if (t.right > box.right) el.scrollBy({ left: t.right - box.right + 12 })
  }, [active])

  function onSwipeEnd(event) {
    const start = swipe.current
    swipe.current = null
    if (!start || event.pointerId !== start.id) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return
    setActive((current) => Math.min(images.length - 1, Math.max(0, current + (dx < 0 ? 1 : -1))))
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row-reverse md:items-start md:gap-4">
      <div
        className="relative min-w-0 flex-1 touch-pan-y touch-pinch-zoom overflow-hidden rounded-card border border-border bg-surface-muted select-none"
        onPointerDown={(e) => { swipe.current = e.pointerType === 'touch' ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null }}
        onPointerUp={onSwipeEnd}
        onPointerCancel={() => { swipe.current = null }}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={images[active] ?? images[0]}
            alt={alt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 55vw, 45vw"
            priority
            draggable={false}
            className="object-cover"
          />
        </div>
        {badge}
      </div>

      <div
        ref={strip}
        role="tablist"
        aria-label="Product images"
        className={cn(
          'flex min-w-0 flex-nowrap gap-3 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-proximity touch-pan-x touch-pan-y touch-pinch-zoom',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'md:w-20 md:flex-col md:overflow-visible md:snap-none md:touch-auto',
        )}
      >
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1} of ${images.length}`}
            onClick={() => setActive(i)}
            className={cn(
              'relative size-16 shrink-0 snap-start overflow-hidden rounded-media border-2 transition-colors md:size-20',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
              i === active ? 'border-ink' : 'border-border hover:border-border-hover',
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * The product's photos — or, when the chosen colour has photos of its own,
 * that colour's. `variants` = [{ id, value, images }]. A colour without
 * photos keeps the product gallery, so products without colour images look
 * exactly as before. Switching colour starts again at its first photo.
 */
export default function ProductGallery({ images = [], variants = [], alt, badge }) {
  const selection = useVariantSelection()
  const variant = variants.find((v) => v.id === selection?.variantId)
  const own = variant?.images?.length ? variant.images : null
  const shown = own ?? images
  if (!shown.length) return null

  return (
    <GalleryView
      key={own ? variant.id : 'product'}
      images={shown}
      alt={own ? `${alt} — ${variant.value}` : alt}
      badge={badge}
    />
  )
}
