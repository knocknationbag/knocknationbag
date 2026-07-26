'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'

import { mobileNav } from '@/constants/navigation'
import { cn } from '@/utils/cn'

const ICONS = { home: Home, grid: LayoutGrid, heart: Heart, bag: ShoppingBag, user: User }

/**
 * Floating bottom navigation. Mobile only — docs/responsive.md §4.12.
 * The single component in the project that exists at one breakpoint and not
 * another: it is an extra navigation surface, not extra content. Every
 * destination it offers is also reachable from the drawer and the footer.
 *
 * Carries the only permitted shadow in the design system (design.md §9).
 */
export default function MobileNav({ cartCount = 3 }) {
  const pathname = usePathname()
  const activeHref = pathname === '/' ? '/' : mobileNav.find((i) => i.href !== '/' && pathname.startsWith(i.href))?.href

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-4 bottom-4 z-50 rounded-full bg-white shadow-[0_-1px_24px_rgba(17,24,39,0.10)] md:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch justify-between px-2">
        {mobileNav.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive = item.href === activeHref
          const isCart = item.icon === 'bag'

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isCart ? `Cart, ${cartCount} items` : undefined}
                className={cn(
                  'relative flex h-14 flex-col items-center justify-center gap-1 rounded-full transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  isActive ? 'text-gold' : 'text-ink',
                )}
              >
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>

                {isCart && cartCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-[18%] top-2 grid size-4 place-items-center rounded-full bg-gold text-[10px] font-bold leading-none text-ink"
                  >
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
