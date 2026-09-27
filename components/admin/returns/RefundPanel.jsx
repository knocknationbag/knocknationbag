'use client'

import { useActionState, useState } from 'react'
import { BadgeIndianRupee, RefreshCw } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { checkRefundStatus, recordManualRefund, startRefund } from '@/lib/actions/returns'
import { REFUND_METHOD_LABELS, REFUND_STATUS_LABELS } from '@/constants/returns'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate } from '@/utils/formatDate'

const IDLE = { ok: false, error: null }

/**
 * Refund for a return. Offered only once the product passed inspection (or a
 * previous attempt failed); begin_refund() re-checks that, the amount cap and
 * the one-live-refund rule. Online orders go back through Razorpay; COD
 * refunds are paid outside the site and recorded here with their reference.
 */
export default function RefundPanel({ ret, suggested, remaining }) {
  const [startState, start, starting] = useActionState(startRefund, IDLE)
  const [manualState, record, recording] = useActionState(recordManualRefund, IDLE)
  const [checkState, check, checking] = useActionState(checkRefundStatus, IDLE)
  const [confirm, setConfirm] = useState(false)

  const live = ret.refunds.find((r) => r.status !== 'failed')
  const canStart = !live && (ret.status === 'Inspection Passed' || ret.status === 'Refund Pending')
  const online = ret.order?.paymentMethod === 'online'
  const feedback = [startState, manualState, checkState].find((s) => s.error || s.message)

  return (
    <AdminCard title="Refund" description={online ? 'Back to the original online payment.' : 'Cash on Delivery — refunded outside the site.'}>
      <div className="flex flex-col gap-3.5">
        {feedback?.error ? <AuthMessage tone="error">{feedback.error}</AuthMessage> : null}
        {feedback?.ok ? <AuthMessage tone="success">{feedback.message}</AuthMessage> : null}

        {ret.refunds.map((refund) => (
          <div key={refund.id} className="rounded-badge border border-border p-3 text-admin">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold tabular-nums text-ink">{formatPrice(refund.amount)}</span>
              <StatusBadge status={REFUND_STATUS_LABELS[refund.status]} tone={refund.status === 'processed' ? 'success' : refund.status === 'failed' ? 'danger' : 'warning'} />
            </div>
            <p className="mt-1 text-admin-xs text-muted">
              {REFUND_METHOD_LABELS[refund.method]} · {formatAdminDate(refund.createdAt)}
              {refund.razorpayRefundId ? <> · <span className="font-mono">{refund.razorpayRefundId}</span></> : null}
              {refund.reference ? ` · Ref ${refund.reference}` : ''}
            </p>
            {refund.failureReason ? <p className="mt-1 text-admin-xs text-danger">{refund.failureReason}</p> : null}

            {refund.status === 'pending' && refund.method === 'manual' ? (
              <form action={record} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="refundId" value={refund.id} />
                <input type="hidden" name="returnId" value={ret.id} />
                <input type="hidden" name="orderId" value={ret.orderId} />
                <AdminField id={`ref-${refund.id}`} name="reference" label="Payment reference" required maxLength={200}
                  placeholder="UTR / UPI transaction id" hint="Record this only after the money has been sent." />
                <AdminButton type="submit" size="sm" variant="primary" disabled={recording}>
                  {recording ? 'Recording…' : 'Record refund as paid'}
                </AdminButton>
              </form>
            ) : null}

            {refund.status === 'pending' && refund.method === 'razorpay' && refund.razorpayRefundId ? (
              <form action={check} className="mt-3">
                <input type="hidden" name="refundId" value={refund.id} />
                <input type="hidden" name="razorpayRefundId" value={refund.razorpayRefundId} />
                <AdminButton type="submit" size="xs" icon={RefreshCw} disabled={checking}>{checking ? 'Checking…' : 'Check status with Razorpay'}</AdminButton>
              </form>
            ) : null}
          </div>
        ))}

        {canStart ? (
          <form action={start} className="flex flex-col gap-2.5" onSubmit={() => setConfirm(false)}>
            <input type="hidden" name="id" value={ret.id} />
            <AdminField id="refund-amount" name="amount" type="number" min="0.01" step="0.01" max={remaining}
              label="Refund amount (₹)" defaultValue={suggested} required
              hint={`Suggested: what was paid for the returned items, excluding shipping. Up to ${formatPrice(remaining)} is left on this order.`} />
            <label className="flex items-start gap-2 text-admin-sm text-body">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 size-4 accent-[#111827]" />
              The product was received at the warehouse and passed inspection.
            </label>
            <AdminButton type="submit" variant="primary" size="md" icon={BadgeIndianRupee} disabled={!confirm || starting}>
              {starting ? 'Starting refund…' : ret.refunds.length ? 'Retry refund' : online ? 'Refund via Razorpay' : 'Open COD refund'}
            </AdminButton>
          </form>
        ) : !ret.refunds.length ? (
          <p className="text-admin text-body">A refund can be started after the product is received and passes inspection.</p>
        ) : null}
      </div>
    </AdminCard>
  )
}
