'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'

import { formatPrice } from '@/utils/formatPrice'

/**
 * Full-screen search with live suggestions from /api/search (the live
 * catalogue). Escape closes, Enter goes to the full /search results page.
 */
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ categories: [], products: [], for: null })
  const inputRef = useRef(null)
  const router = useRouter()

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    if (!open) return undefined
    const term = query.trim()
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { categories: [], products: [] }))
        .then((json) => setData({ ...json, for: term }))
        .catch(() => {})
    }, term ? 200 : 0)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [open, query])

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

  const results = data.for === query.trim() ? data.products : []
  const searching = query.trim() && data.for !== query.trim()

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
                <p className="font-mono text-eyebrow uppercase text-gold">Browse categories</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {data.categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        onClick={onClose}
                        className="inline-block rounded-full border border-border px-4 py-2 text-[14px] text-ink transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : searching ? (
              <p className="py-6 text-center text-[15px] text-body">Searching…</p>
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
                        <span className="block text-[13px] text-body">{p.subtitle}</span>
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
