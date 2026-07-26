'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Read-only value with a copy button. Used for image URL and path.
 *
 * Confirmation is announced via aria-live rather than only a colour change, so
 * the result is perceivable without sight.
 */
export default function CopyField({ label, value, className }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard blocked (insecure context or denied permission) — select the
      // text instead so the value can still be copied manually.
      const el = document.getElementById(`copy-${label}`)
      el?.select?.()
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-admin-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          id={`copy-${label}`}
          readOnly
          value={value}
          aria-label={label}
          className="h-8 min-w-0 flex-1 rounded-badge border border-border bg-surface-muted px-2 font-mono text-admin-xs text-body focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
        />
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-badge border transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
            copied ? 'border-verified-fg/40 bg-verified-bg text-verified-fg' : 'border-border text-body hover:border-border-hover hover:text-ink',
          )}
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
        </button>
      </div>
      <span aria-live="polite" className="sr-only">{copied ? `${label} copied to clipboard` : ''}</span>
    </div>
  )
}
