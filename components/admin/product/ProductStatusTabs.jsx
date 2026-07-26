'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utils/cn'

/**
 * All / Drafts / Archived tabs shared by the three product list routes.
 *
 * These are real links rather than local state, so each view has its own URL and
 * survives a refresh or a bookmark.
 */
export default function ProductStatusTabs({ products }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/admin/products', label: 'All', count: products.length },
    { href: '/admin/products/drafts', label: 'Drafts', count: products.filter((p) => p.status === 'Draft').length },
    { href: '/admin/products/archived', label: 'Archived', count: products.filter((p) => p.status === 'Archived').length },
  ]

  return (
    <nav aria-label="Product status" className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-admin font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
              active ? 'border-gold text-ink' : 'border-transparent text-body hover:text-ink',
            )}
          >
            {tab.label}
            <span className={cn('rounded-badge px-1.5 font-mono text-admin-xs tabular-nums', active ? 'bg-ink text-white' : 'bg-surface-muted text-muted')}>
              {tab.count}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
