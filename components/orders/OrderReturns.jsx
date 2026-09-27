import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import ReturnRequestForm from './ReturnRequestForm'
import { returnEligibility } from '@/lib/returns/eligibility'
import { REFUND_STATUS_LABELS, RETURN_ERRORS, RETURN_REASONS, RETURN_STATUS_HELP, RETURN_STATUS_TONE } from '@/constants/returns'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate } from '@/utils/formatDate'
import { formatIndiaDate } from '@/utils/indiaDate'

/** Reasons worth explaining once the order has been delivered. */
const SHOW_REASON = ['WINDOW_CLOSED', 'NOT_DOMESTIC', 'NOT_PAID']

/**
 * Returns on the customer's order page: every request with its status, and —
 * while the order is inside its 7-day window — the Return Order form.
 * `owner` tells the form how the server should verify the order is theirs.
 */
export default function OrderReturns({ order, returns = [], owner }) {
  const eligibility = returnEligibility(order, returns)
  if (!returns.length && !eligibility.eligible && !SHOW_REASON.includes(eligibility.reason)) return null

  return (
    <section aria-labelledby="order-returns" className="rounded-card border border-border bg-surface p-5 xl:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="order-returns" className="text-[18px] font-bold text-ink">Returns</h2>
        <Link href="/returns" className="text-[14px] font-semibold text-ink underline underline-offset-4 hover:text-gold">Return policy</Link>
      </div>

      {returns.length ? (
        <ul className="mt-4 flex flex-col gap-4">
          {returns.map((ret) => {
            const refund = ret.refunds.find((r) => r.status !== 'failed')
            return (
              <li key={ret.id} className="rounded-media border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[15px] font-bold text-ink">{ret.number}</p>
                  <Badge variant={RETURN_STATUS_TONE[ret.status] ?? 'neutral'}>{ret.status}</Badge>
                </div>
                <p className="mt-2 text-[14px] text-body">{RETURN_STATUS_HELP[ret.status]}</p>
                {ret.customerMessage ? <p className="mt-2 whitespace-pre-line text-[14px] text-ink">{ret.customerMessage}</p> : null}
                <p className="mt-2 text-[13px] text-body">
                  {RETURN_REASONS[ret.reason]} · Requested {formatAdminDate(ret.requestedAt)} ·{' '}
                  {ret.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}
                </p>
                {refund ? (
                  <p className="mt-2 text-[14px] font-semibold text-ink">
                    Refund {formatPrice(refund.amount)} · {REFUND_STATUS_LABELS[refund.status]}
                    {refund.processedAt ? ` on ${formatAdminDate(refund.processedAt)}` : ''}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className="mt-4">
        {eligibility.eligible ? (
          <ReturnRequestForm items={eligibility.items} owner={owner} deadlineLabel={formatIndiaDate(eligibility.deadline)} />
        ) : SHOW_REASON.includes(eligibility.reason) ? (
          <p className="text-[14px] text-body">{RETURN_ERRORS[eligibility.reason]}</p>
        ) : null}
      </div>
    </section>
  )
}
