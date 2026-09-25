'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { updateOrderStatus } from '@/lib/actions/orders'
import { ORDER_STATUSES } from '@/constants/orders'

const HINTS = {
  Confirmed: 'You have accepted the order.',
  Processing: 'It is being packed.',
  Shipped: 'Handed to the courier — add the tracking number.',
  Delivered: 'Customer has it. A Cash on Delivery order is marked paid.',
  Pending: 'New order, not yet reviewed.',
  Cancelled: 'Stock is returned to inventory. This cannot be undone.',
}

/** Status, courier and tracking number. The database enforces the rules. */
export default function OrderStatusForm({ order }) {
  const [state, formAction, pending] = useActionState(updateOrderStatus, { ok: false, error: null })
  const [status, setStatus] = useState(order.status)
  const locked = order.status === 'Cancelled'

  return (
    <AdminCard title="Update order">
      <form action={formAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="id" value={order.id} />
        {state.error ? <AuthMessage tone="error">{state.error}</AuthMessage> : null}
        {state.ok ? <AuthMessage tone="success">Order updated.</AuthMessage> : null}

        <AdminField id="status" name="status" as="select" label="Status" value={status} disabled={locked}
          onChange={(e) => setStatus(e.target.value)}
          hint={locked ? 'Cancelled orders are final.' : HINTS[status]}>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </AdminField>
        <AdminField id="courier" name="courier" label="Courier" defaultValue={order.courier} placeholder="e.g. Delhivery" disabled={locked} />
        <AdminField id="trackingNumber" name="trackingNumber" label="Tracking number" defaultValue={order.trackingNumber} disabled={locked}
          hint="Shown to the customer on their order page." />

        {locked ? null : (
          <AdminButton type="submit" variant={status === 'Cancelled' ? 'danger' : 'primary'} size="md" icon={Save} disabled={pending}>
            {pending ? 'Saving…' : status === 'Cancelled' && order.status !== 'Cancelled' ? 'Cancel order' : 'Save'}
          </AdminButton>
        )}
      </form>
    </AdminCard>
  )
}
