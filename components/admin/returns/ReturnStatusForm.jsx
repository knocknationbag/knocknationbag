'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { updateReturnStatus } from '@/lib/actions/returns'
import { RETURN_TRANSITIONS } from '@/constants/returns'

const HINTS = {
  'Under Review': 'You are looking into the request.',
  Approved: 'Tell the customer a courier pickup will be arranged — they must not ship it themselves.',
  Rejected: 'The request is refused. The message to the customer is required.',
  'Awaiting Return': 'Pickup is booked with the courier partner.',
  'Return Received': 'The product reached the warehouse.',
  'Inspection Passed': 'Unused, unaltered, original packaging, tags and invoice. A refund can then be started.',
  'Inspection Failed': 'It does not meet the return conditions. No refund.',
  Closed: 'Nothing further to do.',
}

/** Moves a return to its next step. update_return_status() enforces the order. */
export default function ReturnStatusForm({ ret }) {
  const [state, formAction, pending] = useActionState(updateReturnStatus, { ok: false, error: null })
  const options = RETURN_TRANSITIONS[ret.status] ?? []
  const [status, setStatus] = useState(options[0] ?? '')

  if (!options.length) {
    return (
      <AdminCard title="Update return">
        <p className="text-admin text-body">
          {ret.status === 'Inspection Passed' || ret.status === 'Refund Pending'
            ? 'Next step: the refund, below.'
            : 'This return has no further steps.'}
        </p>
      </AdminCard>
    )
  }

  return (
    <AdminCard title="Update return">
      <form action={formAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="id" value={ret.id} />
        <input type="hidden" name="orderId" value={ret.orderId} />
        {state.error ? <AuthMessage tone="error">{state.error}</AuthMessage> : null}
        {state.ok ? <AuthMessage tone="success">{state.message}</AuthMessage> : null}

        <AdminField id="return-status" name="status" as="select" label="Move to" value={status}
          onChange={(e) => setStatus(e.target.value)} hint={HINTS[status]}>
          {options.map((s) => <option key={s} value={s}>{s}</option>)}
        </AdminField>
        <AdminField id="customer-message" name="customerMessage" as="textarea" rows={3}
          label={status === 'Rejected' ? 'Reason for the customer' : 'Message to the customer (optional)'}
          required={status === 'Rejected'} maxLength={1000}
          hint="Shown on the customer's order page." />
        <AdminField id="internal-note" name="internalNote" as="textarea" rows={2} label="Internal note (optional)"
          maxLength={1000} hint="Team only. Never shown to the customer." />

        <AdminButton type="submit" variant={status === 'Rejected' || status === 'Inspection Failed' ? 'danger' : 'primary'} size="md" icon={Save} disabled={pending}>
          {pending ? 'Saving…' : `Move to ${status}`}
        </AdminButton>
      </form>
    </AdminCard>
  )
}
