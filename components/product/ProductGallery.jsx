'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@/utils/cn'

/** Main image plus thumbnail rail. Thumbnails are a real tablist for keyboard use. */
export default function ProductGallery({ images = [], alt, badge }) {
  const [active, setActive] = useState(0)
  if (!images.length) return null

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:gap-4">
      <div className="relative flex-1 overflow-hidden rounded-card border border-border bg-surface-muted">
        <div className="relative aspect-square w-full">
          <Image
            src={images[active]}
            alt={alt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 55vw, 45vw"
            priority
            className="object-cover"
          />
        </div>
        {badge}
      </div>

      <div
        role="tablist"
        aria-label="Product images"
        className="flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <button
            key={src + i}
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1} of ${images.length}`}
            onClick={() => setActive(i)}
            className={cn(
              'relative size-16 shrink-0 overflow-hidden rounded-media border-2 transition-colors md:size-20',
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
