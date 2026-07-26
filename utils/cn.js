import clsx from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Custom font-size tokens declared in the `@theme` block of app/globals.css.
 *
 * tailwind-merge only knows Tailwind's stock scale, so an unknown `text-*`
 * utility is treated as a text COLOUR. That made `cn('text-white', 'text-btn-sm')`
 * silently drop `text-white` — every custom-sized element fell back to the
 * inherited body colour. Registering the tokens here fixes the whole codebase
 * at once.
 *
 * Keep this list in sync with the `--text-*` tokens in globals.css.
 */
const FONT_SIZES = [
  'display', 'display-md', 'display-xl',
  'h2', 'h2-md', 'h2-xl',
  'h2-plain', 'h2-plain-md', 'h2-plain-xl',
  'banner', 'banner-md', 'banner-xl',
  'eyebrow',
  'lead', 'lead-md', 'lead-xl',
  'card-title', 'card-title-md', 'card-title-xl',
  'card-price', 'card-price-md', 'card-price-xl',
  'nav', 'btn', 'btn-sm', 'micro',
  'footer-heading', 'footer-link',
  // admin dashboard scale
  'admin-xs', 'admin-sm', 'admin', 'admin-md', 'admin-lg',
  'admin-title', 'admin-h1', 'admin-stat',
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
    },
  },
})

/**
 * Merge Tailwind classes with correct conflict resolution.
 * Always use this for conditional or forwarded className values —
 * never template-literal concatenation. See docs/CLAUDE.md §6.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
