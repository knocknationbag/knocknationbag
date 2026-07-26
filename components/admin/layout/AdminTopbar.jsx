'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ExternalLink, Menu, Search } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AdminUserMenu from './AdminUserMenu'
import { findAdminNavItem } from '@/constants/adminNav'
import { ADMIN_HOME } from '@/lib/auth/routes'
import { cn } from '@/utils/cn'

/**
 * Sticky topbar: breadcrumb trail, global search, and the account menu.
 * Height matches the sidebar header (56px) so the two align on the same baseline.
 */
export default function AdminTopbar({ onOpenSidebar, user }) {
  const pathname = usePathname()
  const current = findAdminNavItem(pathname)

  // /admin/products/new -> ['Products', 'New']
  const tail = pathname
    .replace(current?.href ?? ADMIN_HOME, '')
    .split('/')
    .filter(Boolean)
    .map((s) => s.replace(/-/g, ' '))

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/95 px-3 backdrop-blur md:px-4">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="grid size-8 shrink-0 place-items-center rounded-badge text-ink transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold xl:hidden"
      >
        <Menu size={17} strokeWidth={2} aria-hidden="true" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-admin">
          <li>
            <Link href={ADMIN_HOME} className="text-body transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold">
              Dashboard
            </Link>
          </li>
          {current && current.href !== ADMIN_HOME ? (
            <>
              <li aria-hidden="true" className="text-muted">/</li>
              <li>
                {tail.length ? (
                  <Link href={current.href} className="text-body transition-colors hover:text-gold">{current.label}</Link>
                ) : (
                  <span className="font-semibold text-ink" aria-current="page">{current.label}</span>
                )}
              </li>
            </>
          ) : null}
          {tail.map((seg, i) => (
            <li key={seg + i} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-muted">/</span>
              <span className={cn('capitalize', i === tail.length - 1 ? 'font-semibold text-ink' : 'text-body')}>
                {seg}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="relative hidden w-[220px] lg:block">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <label htmlFor="admin-global-search" className="sr-only">Search the dashboard</label>
        <input
          id="admin-global-search"
          type="search"
          placeholder="Search products, orders…"
          className="h-8 w-full rounded-badge border border-border bg-surface-muted pl-8 pr-2.5 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
        />
      </div>

      <AdminButton href="/" size="sm" icon={ExternalLink} variant="ghost" className="hidden md:inline-flex">
        View site
      </AdminButton>

      <button
        type="button"
        aria-label="Notifications, 3 unread"
        className="relative grid size-8 shrink-0 place-items-center rounded-badge text-ink transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
      >
        <Bell size={16} strokeWidth={2} aria-hidden="true" />
        <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-gold" />
      </button>

      {user ? <AdminUserMenu user={user} /> : null}
    </header>
  )
}
