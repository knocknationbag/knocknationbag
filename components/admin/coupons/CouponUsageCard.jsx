'use client'

import { startTransition, useActionState, useState } from 'react'
import { Archive } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { ConfirmDialog } from '@/components/admin/ui/Overlay'
import { archiveCoupon } from '@/lib/actions/coupons'

/**
 * Usage numbers and the archive action for an existing coupon. "Held" are
 * online orders waiting for payment — they count toward the limits until paid
 * or until their 30-minute hold lapses.
 */
export default function CouponUsageCard({ coupon }) {
  const [state, action, pending] = useActionState(archiveCoupon, { ok: false, error: null })
  const [confirming, setConfirming] = useState(false)

  const limit = coupon.usageLimit ? ` of ${coupon.usageLimit}` : ''

  return (
    <AdminCard title="Usage">
      <dl className="flex flex-col gap-1.5 text-admin">
        <div className="flex justify-between gap-3"><dt className="text-body">Used on orders</dt><dd className="font-semibold tabular-nums text-ink">{coupon.used}{limit}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-body">Held (awaiting payment)</dt><dd className="tabular-nums text-ink">{coupon.held}</dd></div>
      </dl>

      {coupon.archivedAt ? null : (
        <div className="mt-4 border-t border-border pt-4">
          {state.error ? <AuthMessage tone="error" className="mb-3">{state.error}</AuthMessage> : null}
          <AdminButton size="sm" variant="danger" icon={Archive} disabled={pending} onClick={() => setConfirming(true)}>
            {pending ? 'Archiving…' : 'Archive coupon'}
          </AdminButton>
          <p className="mt-2 text-admin-xs text-muted">Archived coupons stop working immediately. Orders that used it keep their discount.</p>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Archive ${coupon.code}?`}
        description="Customers will no longer be able to use this code. This cannot be undone — create a new coupon to offer it again."
        confirmLabel="Archive"
        onConfirm={() => {
          setConfirming(false)
          const data = new FormData()
          data.set('id', coupon.id)
          startTransition(() => action(data))
        }}
      />
    </AdminCard>
  )
}
