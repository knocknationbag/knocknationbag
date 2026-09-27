'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Undo2 } from 'lucide-react'

import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import AuthNotice from '@/components/auth/AuthNotice'
import { requestReturn } from '@/lib/returns/actions'
import { RETURN_CONDITIONS, RETURN_REASONS } from '@/constants/returns'

const CHECK = 'mt-0.5 size-4 shrink-0 accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

/**
 * "Return Order". Collapsed to one button until the customer asks for it.
 * `owner` is { orderNumber } for a signed-in customer or { accessToken } for
 * a guest — the server uses it to prove the order is theirs, and decides
 * eligibility itself.
 */
export default function ReturnRequestForm({ items, owner, deadlineLabel }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(requestReturn, { ok: false, error: null })

  useEffect(() => {
    if (state.ok) router.refresh()
  }, [state, router])

  if (state.ok) {
    return (
      <AuthNotice tone="success">
        Return {state.returnNumber} requested. Please do not ship the product — our team will confirm and arrange a courier pickup from your address.
      </AuthNotice>
    )
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="md" icon={Undo2} onClick={() => setOpen(true)} className="self-start">Return Order</Button>
        <p className="text-[13px] text-body">Returns can be requested until {deadlineLabel}.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {owner.orderNumber ? <input type="hidden" name="orderNumber" value={owner.orderNumber} /> : null}
      {owner.accessToken ? <input type="hidden" name="accessToken" value={owner.accessToken} /> : null}
      {state.error ? <AuthNotice tone="error">{state.error}</AuthNotice> : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-[15px] font-bold text-ink">Items to return</legend>
        {items.filter((item) => item.returnable > 0).map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3">
            <span className="min-w-0 text-[14px] text-body">
              <span className="font-semibold text-ink">{item.name}</span>
              {item.variantLabel ? ` · ${item.variantLabel}` : ''}
            </span>
            <Field as="select" id={`qty-${item.id}`} name={`qty_${item.id}`} label={`Quantity of ${item.name} to return`} hideLabel
              defaultValue={items.length === 1 ? String(item.returnable) : '0'} className="w-28">
              {Array.from({ length: item.returnable + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
            </Field>
          </div>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-[15px] font-bold text-ink">Reason</legend>
        {Object.entries(RETURN_REASONS).map(([value, label]) => (
          <label key={value} className="flex items-start gap-3 text-[14px] text-body">
            <input type="radio" name="reason" value={value} required className={CHECK} />
            {label}
          </label>
        ))}
      </fieldset>

      <Field as="textarea" id="return-details" name="details" rows={3} maxLength={1000} label="Tell us more (optional)"
        hint="For a defect, describe what is wrong." />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-[15px] font-bold text-ink">Please confirm</legend>
        {RETURN_CONDITIONS.map((text, i) => (
          <label key={text} className="flex items-start gap-3 text-[14px] text-body">
            <input type="checkbox" name={`condition_${i}`} required className={CHECK} />
            {text}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" variant="primary" size="md" disabled={pending}>{pending ? 'Sending…' : 'Request return'}</Button>
        <Button variant="ghost" size="md" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
      </div>
    </form>
  )
}
