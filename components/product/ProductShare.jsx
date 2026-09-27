'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link2, MessageCircle, Share2 } from 'lucide-react'

import { cn } from '@/utils/cn'

const CHIP =
  'inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-semibold text-ink ' +
  'transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

const noop = () => () => {}

/**
 * The absolute product URL. Built in the browser from the page's own origin,
 * so it is always the domain the customer is actually on (the production
 * domain once deployed, localhost only in development). NEXT_PUBLIC_SITE_URL
 * overrides it when set — the same rule as lib/auth/origin.js. The product
 * page is statically generated, so the server cannot know the host itself.
 * Null during server render.
 */
function useProductUrl(path) {
  const origin = useSyncExternalStore(
    noop,
    () => (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, ''),
    () => null,
  )
  return origin ? `${origin}${path}` : null
}

/** Clipboard API where available; the textarea fallback covers older browsers. */
async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = Object.assign(document.createElement('textarea'), { value: text, readOnly: true })
  area.setAttribute('aria-hidden', 'true')
  area.className = 'fixed -left-[9999px] top-0'
  document.body.appendChild(area)
  area.select()
  const done = document.execCommand('copy')
  area.remove()
  if (!done) throw new Error('copy failed')
}

/**
 * Share a product: WhatsApp, the device's own share menu (Web Share API, when
 * the browser has it) and Copy link. WhatsApp and Copy link are always shown,
 * so they are the fallback wherever native sharing is missing. Only the public
 * product name and URL are shared.
 */
export default function ProductShare({ name, slug, className }) {
  const url = useProductUrl(`/product/${slug}`)
  const canShare = useSyncExternalStore(noop, () => typeof navigator.share === 'function', () => false)
  const [status, setStatus] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function flash(text, ok = true) {
    setStatus({ text, ok })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(null), 2500)
  }

  async function copy() {
    try {
      await copyText(url)
      flash('Link copied')
    } catch {
      flash('Could not copy — press and hold the address bar to copy the link.', false)
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: name, text: name, url })
    } catch (error) {
      // Closing the share sheet is not an error; anything else falls back to copying.
      if (error?.name !== 'AbortError') await copy()
    }
  }

  const whatsapp = url ? `https://wa.me/?text=${encodeURIComponent(`${name} — ${url}`)}` : undefined

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="text-[14px] font-semibold text-ink">Share this product</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={whatsapp ? undefined : 'true'}
          aria-label={`Share ${name} on WhatsApp (opens in a new tab)`}
          className={cn(CHIP, !whatsapp && 'pointer-events-none opacity-50')}
        >
          <MessageCircle size={18} aria-hidden="true" /> WhatsApp
        </a>
        {canShare ? (
          <button type="button" onClick={nativeShare} disabled={!url} className={CHIP} aria-label={`Share ${name}`}>
            <Share2 size={18} aria-hidden="true" /> Share
          </button>
        ) : null}
        <button type="button" onClick={copy} disabled={!url} className={CHIP} aria-label={`Copy link to ${name}`}>
          <Link2 size={18} aria-hidden="true" /> Copy link
        </button>
      </div>
      <p role="status" aria-live="polite" className={cn('min-h-5 text-[13px] font-semibold', status?.ok === false ? 'text-danger' : 'text-verified-fg')}>
        {status?.text}
      </p>
    </div>
  )
}
