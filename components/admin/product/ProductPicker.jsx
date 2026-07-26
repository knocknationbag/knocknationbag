'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Plus, Search, X } from 'lucide-react'

import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

/**
 * Searchable product multi-select. Backs Related products, Cross-sell and
 * Upsell — three fields with identical mechanics, so one component.
 *
 * `value` is an array of slugs; the picker resolves them against `products`.
 */
export default function ProductPicker({
  id,
  label,
  hint,
  value = [],
  onChange,
  products,
  excludeSlug,
  max = 8,
  className,
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = value.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => p.slug !== excludeSlug && !value.includes(p.slug))
      .filter((p) => !q || `${p.title} ${p.brand} ${p.category}`.toLowerCase().includes(q))
      .slice(0, 6)
  }, [products, query, value, excludeSlug])

  const atLimit = selected.length >= max

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-admin-sm font-semibold text-ink">{label}</label>
        <span className="font-mono text-admin-xs text-muted">{selected.length}/{max}</span>
      </div>

      {selected.length ? (
        <ul className="flex flex-col gap-1.5">
          {selected.map((p) => (
            <li key={p.slug} className="flex items-center gap-2 rounded-badge border border-border bg-surface px-2 py-1.5">
              <span className="relative size-7 shrink-0 overflow-hidden rounded-[4px] border border-border">
                <Image src={p.image} alt="" fill sizes="28px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-admin font-medium text-ink">{p.title}</span>
                <span className="block truncate text-admin-xs text-muted">{p.brand} · {formatPrice(p.price)}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange?.(value.filter((s) => s !== p.slug))}
                aria-label={`Remove ${p.title}`}
                className="grid size-6 shrink-0 place-items-center rounded-badge text-muted transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!atLimit ? (
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id={id}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Search products to link…"
            className="h-8 w-full rounded-badge border border-border bg-surface pl-8 pr-2.5 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
          />

          {open && matches.length ? (
            <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-badge border border-border bg-surface py-1">
              {matches.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onChange?.([...value, p.slug]); setQuery('') }}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold"
                  >
                    <span className="relative size-6 shrink-0 overflow-hidden rounded-[4px]">
                      <Image src={p.image} alt="" fill sizes="24px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-admin text-ink">{p.title}</span>
                    <Plus size={12} className="shrink-0 text-muted" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="text-admin-xs text-muted">Maximum of {max} reached — remove one to add another.</p>
      )}

      {hint ? <p className="text-admin-xs text-muted">{hint}</p> : null}
    </div>
  )
}
