'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * 34px white circle padded out to a 44px hit area — docs/accessibility.md §8.
 * Local state today; Phase 4 swaps it for the wishlist store without changing the markup.
 *
 * The reference exports a crossed-out `heart-off` glyph here; that is a Figma slip
 * (it reads as "remove") — docs/design.md §14, deviation 7.
 */
export default function WishlistButton({ productId, title, isActive = false, onToggle, className }) {
  const [active, setActive] = useState(isActive)

  function handleClick() {
    setActive((current) => !current)
    onToggle?.(productId, !active)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Add'} ${title} ${active ? 'from' : 'to'} wishlist`}
      className={cn(
        'group/wish inline-grid size-11 place-items-center rounded-full',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        className,
      )}
    >
      <span
        className={cn(
          'grid size-8 place-items-center rounded-full bg-white transition-transform duration-[180ms] ease-out',
          'group-hover/wish:scale-110 group-active/wish:scale-95 xl:size-[34px]',
        )}
      >
        <Heart
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={cn('transition-colors', active ? 'fill-gold text-gold' : 'fill-transparent text-ink')}
        />
      </span>
    </button>
  )
}
