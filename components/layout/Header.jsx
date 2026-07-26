'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react'

import Logo from '@/components/common/Logo'
import MobileDrawer from './MobileDrawer'
import MegaMenu from './MegaMenu'
import SearchOverlay from './SearchOverlay'
import Container from './Container'
import { headerActions, headerNav, megaMenus } from '@/constants/navigation'
import { cn } from '@/utils/cn'

const ACTION_ICONS = { heart: Heart, user: User }

/**
 * docs/design.md §11 — 80px desktop/tablet, 56px mobile, sticky, hairline border.
 * Client because it owns the drawer, mega-menu and search overlay state.
 * Mega panels open on hover and on keyboard focus (group-focus-within).
 */
export default function Header({ cartCount = 3 }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface">
        <Container className="flex h-14 items-center justify-between gap-4 md:h-20">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="-ml-2.5 grid size-11 place-items-center rounded-full text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:hidden"
          >
            <Menu size={24} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0">
            <Logo size={30} className="md:hidden" />
            <Logo size={38} className="hidden md:flex" />
          </div>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-5 xl:gap-7">
              {headerNav.map((item) => {
                const menu = item.mega ? megaMenus[item.mega] : null
                return (
                  <li key={item.href} className={cn(menu && 'group static')}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'text-nav font-medium transition-colors duration-150 ease-out',
                        isActive(item.href) ? 'text-gold' : 'text-ink hover:text-gold',
                      )}
                    >
                      {item.label}
                    </Link>

                    {menu ? (
                      <div className="pointer-events-none invisible opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                        <MegaMenu menu={menu} />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid size-11 place-items-center rounded-full text-ink transition-colors duration-150 ease-out hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Search size={22} strokeWidth={2} aria-hidden="true" />
            </button>

            {headerActions.map((action) => {
              const Icon = ACTION_ICONS[action.icon]
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  aria-label={action.label}
                  className="hidden size-11 place-items-center rounded-full text-ink transition-colors duration-150 ease-out hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:grid"
                >
                  <Icon size={22} strokeWidth={2} aria-hidden="true" />
                </Link>
              )
            })}

            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              className="relative grid size-11 place-items-center rounded-full text-ink transition-colors duration-150 ease-out hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <ShoppingBag size={22} strokeWidth={2} aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 grid size-[18px] place-items-center rounded-full bg-gold text-[11px] font-bold leading-none text-ink"
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </Container>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={headerNav}
        actions={headerActions}
        activeHref={pathname}
      />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
