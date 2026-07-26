import { cn } from '@/utils/cn'

/**
 * Status pill. Tones map onto the existing palette only — no new colours.
 * Every status label in the dashboard goes through here so a "Published" chip
 * looks identical in Products, Blog and CMS Pages.
 */
const TONES = {
  success: 'bg-verified-bg text-verified-fg',
  warning: 'bg-gold/15 text-[#6B5618]',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-surface-muted text-body border border-border',
  ink: 'bg-ink text-white',
  gold: 'bg-gold text-ink',
  muted: 'bg-surface-muted text-muted border border-border',
  verified: 'bg-verified-bg text-verified-fg',
}

/** Shared vocabulary so the same word never gets two different colours. */
export const STATUS_TONE = {
  Published: 'success',
  Active: 'success',
  Delivered: 'success',
  Paid: 'success',
  Approved: 'success',
  'In stock': 'success',
  Draft: 'neutral',
  Scheduled: 'warning',
  Pending: 'warning',
  Processing: 'warning',
  'In transit': 'warning',
  'Low stock': 'warning',
  Review: 'warning',
  Archived: 'muted',
  Hidden: 'muted',
  Inactive: 'muted',
  Cancelled: 'danger',
  Failed: 'danger',
  Refunded: 'danger',
  'Out of stock': 'danger',
  Rejected: 'danger',
  Featured: 'gold',
  NoIndex: 'danger',
  Index: 'success',
}

export default function StatusBadge({ status, tone, className }) {
  const resolved = tone ?? STATUS_TONE[status] ?? 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-badge px-2 py-0.5 text-admin-xs font-semibold',
        TONES[resolved],
        className,
      )}
    >
      {status}
    </span>
  )
}
