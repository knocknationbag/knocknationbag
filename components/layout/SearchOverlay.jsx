'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'

import { products } from '@/data/products'
import { searchProducts } from '@/utils/catalog'
import { formatPrice } from '@/utils/formatPrice'

const SUGGESTIONS = ['Leather tote', 'Carry-on', 'Laptop backpack', 'Weekender', 'Crossbody']

/** Full-screen search with live suggestions. Escape closes, Enter goes to /search. */
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return undefined
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const results = searchProducts(products, query).slice(0, 6)

  function submit(event) {
    event.preventDefault()
    if (!query.trim()) return
    onClose()
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} />

      <div className="relative mx-auto w-full max-w-[860px] px-4 pt-16 md:pt-24">
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-border px-5">
            <Search size={20} className="shrink-0 text-body" aria-hidden="true" />
            <label htmlFor="site-search" className="sr-only">Search products</label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bags, categories, materials…"
              className="h-16 w-full bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-body hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-5">
            {!query ? (
              <>
                <p className="font-mono text-eyebrow uppercase text-gold">Popular searches</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-full border border-border px-4 py-2 text-[14px] text-ink transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : results.length === 0 ? (
              <p className="py-6 text-center text-[15px] text-body">
                No products match “{query}”. Try a broader term.
              </p>
            ) : (
              <ul className="flex flex-col gap-1" aria-live="polite">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 rounded-card p-2 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-media">
                        <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold text-ink">{p.title}</span>
                        <span className="block text-[13px] text-body">{p.brand}</span>
                      </span>
                      <span className="text-[15px] font-bold text-ink">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
