'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

import { cn } from '@/utils/cn'

const TONES = {
  success: { icon: CheckCircle2, ring: 'border-verified-fg/25', dot: 'text-verified-fg' },
  error: { icon: TriangleAlert, ring: 'border-danger/30', dot: 'text-danger' },
  info: { icon: Info, ring: 'border-border', dot: 'text-gold' },
}

/**
 * Toast presentation. Phase 2 is static, so this renders on demand rather than
 * from a global queue; Phase 4 can swap the trigger for a store subscription
 * without changing the markup.
 *
 * role="status" + aria-live so it is announced without stealing focus.
 */
export default function Toast({ tone = 'info', title, description, onDismiss, className }) {
  const [visible, setVisible] = useState(true)
  const { icon: Icon, ring, dot } = TONES[tone] ?? TONES.info

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-card border bg-surface p-4',
        'shadow-[0_8px_28px_rgba(17,24,39,0.10)]',
        ring,
        className,
      )}
    >
      <Icon size={20} strokeWidth={2} className={cn('mt-0.5 shrink-0', dot)} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-ink">{title}</p>
        {description ? <p className="mt-1 text-[14px] leading-[21px] text-body">{description}</p> : null}
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => {
          setVisible(false)
          onDismiss?.()
        }}
        className="-m-2 grid size-9 shrink-0 place-items-center rounded-full text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <X size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}

/** Fixed viewport region that stacks toasts above the mobile bottom nav. */
export function ToastViewport({ children }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-3 md:bottom-6 md:left-auto md:right-6 md:items-end">
      {children}
    </div>
  )
}
