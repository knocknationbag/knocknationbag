'use client'

import { useEffect, useSyncExternalStore } from 'react'

import ProductGrid from './ProductGrid'
import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'

const KEY = 'knb.recently-viewed'
const MAX = 4
const EMPTY = []

/**
 * Tiny localStorage-backed store.
 *
 * Read via useSyncExternalStore rather than useEffect + setState: reading an
 * external store inside an effect causes a cascading render (and trips
 * react-hooks/set-state-in-effect). The snapshot is memoised on the raw string
 * so getSnapshot stays referentially stable between renders.
 *
 * Phase 4 replaces this with the Zustand store; the component API stays the same.
 */
const store = {
  listeners: new Set(),
  rawCache: null,
  parsedCache: EMPTY,

  subscribe(listener) {
    store.listeners.add(listener)
    window.addEventListener('storage', listener)
    return () => {
      store.listeners.delete(listener)
      window.removeEventListener('storage', listener)
    }
  },

  getSnapshot() {
    let raw = '[]'
    try {
      raw = window.localStorage.getItem(KEY) ?? '[]'
    } catch {
      raw = '[]'
    }
    if (raw !== store.rawCache) {
      store.rawCache = raw
      try {
        const parsed = JSON.parse(raw)
        store.parsedCache = Array.isArray(parsed) ? parsed : EMPTY
      } catch {
        store.parsedCache = EMPTY
      }
    }
    return store.parsedCache
  },

  getServerSnapshot() {
    return EMPTY
  },

  push(slug) {
    const current = store.getSnapshot()
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX + 1)
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      return // storage unavailable — the feature degrades silently
    }
    store.listeners.forEach((listener) => listener())
  },
}

export default function RecentlyViewed({ currentSlug, allProducts }) {
  const slugs = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  // Writing to an external system is exactly what an effect is for.
  useEffect(() => {
    if (currentSlug) store.push(currentSlug)
  }, [currentSlug])

  const items = slugs
    .filter((slug) => slug !== currentSlug)
    .slice(0, MAX)
    .map((slug) => allProducts.find((product) => product.slug === slug))
    .filter(Boolean)

  // Owns its own Section so an empty history leaves no stray background band.
  if (items.length === 0) return null

  return (
    <Section background="muted">
      <SectionHeader eyebrow="PICK UP WHERE YOU LEFT OFF" title="Recently Viewed" align="left" />
      <ProductGrid products={items} columns={4} />
    </Section>
  )
}
