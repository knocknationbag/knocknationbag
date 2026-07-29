'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, ChevronLeft, FileText, Folder, Gauge, Image as ImageIcon, Layers, LayoutGrid,
  ListOrdered, Mail, Newspaper, Package, PanelsTopLeft, Percent, ScrollText, Search,
  Settings, Shapes, ShieldCheck, Star, Tags, Users, Warehouse, X,
} from 'lucide-react'

import Logo from '@/components/common/Logo'
import { adminNav } from '@/constants/adminNav'
import { MODULE_PERMISSION, roleCan } from '@/constants/adminRoles'
import { cn } from '@/utils/cn'

const ICONS = {
  dashboard: Gauge, analytics: BarChart3, products: Package, categories: Shapes,
  collections: Layers, brands: Tags, inventory: Warehouse, orders: ListOrdered,
  customers: Users, reviews: Star, coupons: Percent, pages: FileText, blog: Newspaper,
  banners: PanelsTopLeft, media: ImageIcon, forms: Mail, seo: Search, redirects: Folder,
  users: Users, roles: ShieldCheck, logs: ScrollText, settings: Settings,
}

/**
 * Sticky sidebar on the ink surface — the same dark panel as the site footer, so
 * the dashboard reads as the same brand.
 *
 * Desktop: sticky, collapsible to a 60px icon rail.
 * Tablet/mobile: off-canvas drawer driven by AdminShell.
 *
 * Items the current role cannot access are not rendered. This is presentation
 * only — real authorisation happens server-side (constants/adminRoles.js).
 */
export default function AdminSidebar({ open, onClose, collapsed, onToggleCollapse, role = 'super-admin' }) {
  const pathname = usePathname()

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile/tablet scrim */}
      <div
        className={cn('fixed inset-0 z-[60] bg-ink/50 transition-opacity xl:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Dashboard navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-[70] flex flex-col bg-ink transition-[transform,width] duration-250',
          '[transition-timing-function:var(--ease-out-soft)]',
          open ? 'translate-x-0' : '-translate-x-full',
          'xl:sticky xl:top-0 xl:h-svh xl:translate-x-0',
          collapsed ? 'w-[240px] xl:w-[60px]' : 'w-[240px]',
        )}
      >
        <div className={cn('flex h-14 shrink-0 items-center gap-2 border-b border-white/10', collapsed ? 'xl:justify-center xl:px-0' : 'px-4')}>
          {/*
            Two sizes, one asset. The 240px sidebar has room for the lockup at a
            legible size; the 60px collapsed rail does not, so it keeps the
            smaller one. Logo derives width from height, so neither can stretch.
          */}
          <Logo variant="white" size={34} className={cn(collapsed && 'xl:hidden')} />
          <Logo variant="white" size={26} href="/admin" className={cn('hidden', collapsed && 'xl:flex')} />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto grid size-8 place-items-center rounded-badge text-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold xl:hidden"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {adminNav.map((group) => {
            const visible = group.items.filter((item) => {
              const permission = MODULE_PERMISSION[item.href]
              return !permission || roleCan(role, permission)
            })
            if (!visible.length) return null

            return (
              <div key={group.group} className="mb-4 last:mb-0">
                <p className={cn('px-2 pb-1.5 font-mono text-admin-xs uppercase tracking-[0.1em] text-white/35', collapsed && 'xl:sr-only')}>
                  {group.group}
                </p>

                <ul className="flex flex-col gap-0.5">
                  {visible.map((item) => {
                    const Icon = ICONS[item.icon] ?? LayoutGrid
                    const active = isActive(item.href)

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            'group flex h-8 items-center gap-2.5 rounded-badge px-2 text-admin transition-colors',
                            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                            collapsed && 'xl:justify-center xl:px-0',
                            active ? 'bg-white/10 font-semibold text-gold' : 'text-white/70 hover:bg-white/5 hover:text-white',
                          )}
                        >
                          <Icon size={15} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                          <span className={cn('truncate', collapsed && 'xl:hidden')}>{item.label}</span>

                          {typeof item.count === 'number' ? (
                            <span className={cn('ml-auto rounded-badge bg-white/10 px-1.5 py-0.5 font-mono text-admin-xs tabular-nums text-white/60', collapsed && 'xl:hidden')}>
                              {item.count}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden h-8 w-full items-center gap-2.5 rounded-badge px-2 text-admin text-white/60 transition-colors hover:bg-white/5 hover:text-white xl:flex',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
              collapsed && 'xl:justify-center xl:px-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={15} className={cn('shrink-0 transition-transform', collapsed && 'rotate-180')} aria-hidden="true" />
            <span className={cn(collapsed && 'xl:hidden')}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  )
}
