import { CircleAlert, CircleCheck, Info } from 'lucide-react'

import { cn } from '@/utils/cn'

const TONES = {
  error: { icon: CircleAlert, box: 'border-danger/25 bg-danger/5', text: 'text-danger' },
  success: { icon: CircleCheck, box: 'border-verified-fg/25 bg-verified-bg/60', text: 'text-verified-fg' },
  info: { icon: Info, box: 'border-border bg-surface-muted', text: 'text-body' },
}

/**
 * Inline feedback banner for the auth forms.
 *
 * `role="alert"` so a screen reader announces a failed sign-in immediately —
 * without it the only signal that anything happened is a colour change, which
 * a non-sighted user never receives.
 */
export default function AuthMessage({ tone = 'error', children, className }) {
  if (!children) return null

  const { icon: Icon, box, text } = TONES[tone] ?? TONES.info

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2 rounded-badge border p-2.5', box, className)}
    >
      <Icon size={14} className={cn('mt-px shrink-0', text)} aria-hidden="true" />
      <p className={cn('text-admin-sm leading-[18px]', text)}>{children}</p>
    </div>
  )
}
