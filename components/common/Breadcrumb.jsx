import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import JsonLd from './JsonLd'
import { site } from '@/constants/site'

/**
 * Real <nav>/<ol> breadcrumbs, mirrored into BreadcrumbList JSON-LD.
 * docs/seo.md §3. `items` = [{ label, href }], last item is the current page.
 */
export default function Breadcrumb({ items = [], className }) {
  if (!items.length) return null

  const trail = [{ label: 'Home', href: '/' }, ...items]

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${site.url}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <JsonLd data={ld} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-body">
          {trail.map((item, i) => {
            const isLast = i === trail.length - 1
            return (
              <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                {isLast || !item.href ? (
                  <span className="font-medium text-ink" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {item.label}
                  </Link>
                )}
                {!isLast ? (
                  <ChevronRight size={14} className="text-muted" aria-hidden="true" />
                ) : null}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
