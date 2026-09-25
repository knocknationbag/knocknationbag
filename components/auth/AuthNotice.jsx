import { CircleAlert, CircleCheck, Info } from 'lucide-react'

import { cn } from '@/utils/cn'

const TONES = {
  error: { icon: CircleAlert, box: 'border-danger/25 bg-danger/5', text: 'text-danger' },
  success: { icon: CircleCheck, box: 'border-verified-fg/25 bg-verified-bg/60', text: 'text-verified-fg' },
  info: { icon: Info, box: 'border-border bg-surface-muted', text: 'text-body' },
}

/**
 * Inline feedback for the storefront auth forms, at storefront type sizes.
 * The dashboard has its own (components/admin/auth/AuthMessage) — the two
 * surfaces share tokens, not components (docs/CLAUDE.md §22).
 *
 * Errors use role="alert" so a failed submit is announced immediately.
 */
export default function AuthNotice({ tone = 'error', children, className }) {
  if (!children) return null

  const { icon: Icon, box, text } = TONES[tone] ?? TONES.info

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-card border px-4 py-3', box, className)}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', text)} aria-hidden="true" />
      <div className={cn('text-[14px] leading-[21px]', text)}>{children}</div>
    </div>
  )
}
