'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

/** Inline search input used on the search results page. GET-style navigation. */
export default function SearchField({ defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)
  const router = useRouter()

  function submit(event) {
    event.preventDefault()
    const q = value.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <form onSubmit={submit} role="search" className="flex gap-3">
      <label htmlFor="search-page-input" className="sr-only">Search products</label>
      <div className="relative flex-1">
        <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-body" aria-hidden="true" />
        <input
          id="search-page-input"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search bags, categories, materials…"
          className="h-12 w-full rounded-full border border-border bg-white pl-12 pr-5 text-[15px] text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
      </div>
      <button
        type="submit"
        className="h-12 shrink-0 rounded-full bg-gold px-6 text-[15px] font-semibold text-ink transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Search
      </button>
    </form>
  )
}
