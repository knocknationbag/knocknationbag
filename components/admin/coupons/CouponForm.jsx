'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { saveCoupon } from '@/lib/actions/coupons'
import { COUPON_TYPES } from '@/constants/coupons'

const INITIAL = { ok: false, error: null, fieldErrors: {} }

/**
 * Create / edit a coupon. The server validates everything again; the table's
 * check constraints are the last word. Changing a coupon never changes orders
 * already placed with it — they keep the discount they were given.
 */
export default function CouponForm({ coupon = null, expiresOn = '', aside = null }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(saveCoupon, INITIAL)
  const [type, setType] = useState(coupon?.type ?? 'percentage')
  const [active, setActive] = useState(coupon?.isActive ?? true)
  const errors = state.fieldErrors ?? {}
  const locked = Boolean(coupon?.archivedAt)

  useEffect(() => {
    if (state.ok && state.created) router.replace(`/admin/coupons/${state.id}`)
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={coupon?.id ?? ''} />
      {active ? <input type="hidden" name="isActive" value="on" /> : null}

      {state.error ? <AuthMessage tone="error">{state.error}</AuthMessage> : null}
      {state.ok && !state.created ? <AuthMessage tone="success">Coupon saved.</AuthMessage> : null}
      {locked ? <AuthMessage tone="info">This coupon is archived. It cannot be used or edited.</AuthMessage> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <AdminCard title="Coupon" description="What the customer types, and what it gives them.">
            <fieldset disabled={locked} className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 md:grid-cols-2">
                <AdminField id="code" name="code" label="Code" required defaultValue={coupon?.code ?? ''} error={errors.code}
                  placeholder="SAVE10" hint="Letters and numbers. Customers can type it in any case."
                  className="[&_input]:font-mono [&_input]:uppercase" />
                <AdminField id="type" name="type" as="select" label="Type" value={type} error={errors.type}
                  onChange={(e) => setType(e.target.value)}>
                  {Object.entries(COUPON_TYPES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </AdminField>
              </div>

              <div className="grid gap-3.5 md:grid-cols-2">
                {type === 'free_shipping' ? (
                  <AdminField id="value" label="Discount" value="Shipping fee waived" disabled onChange={() => {}} />
                ) : (
                  <AdminField key={type} id="value" name="value" type="number" min="0" step={type === 'percentage' ? '1' : '0.01'} required
                    label={type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                    defaultValue={coupon?.type === type ? coupon.value : ''} error={errors.value}
                    placeholder={type === 'percentage' ? '10' : '500'} />
                )}
                {type === 'percentage' ? (
                  <AdminField id="maxDiscountAmount" name="maxDiscountAmount" type="number" min="0" step="0.01"
                    label="Maximum discount (₹)" defaultValue={coupon?.maxDiscountAmount ?? ''} error={errors.maxDiscountAmount}
                    hint="Optional cap on the rupee amount." />
                ) : null}
              </div>

              <AdminField id="description" name="description" label="Internal note" defaultValue={coupon?.description ?? ''}
                error={errors.description} placeholder="Diwali campaign" hint="Only the team sees this." />
            </fieldset>
          </AdminCard>

          <AdminCard title="Conditions" description="Leave a field empty for no restriction.">
            <fieldset disabled={locked} className="grid gap-3.5 md:grid-cols-2">
              <AdminField id="minOrderAmount" name="minOrderAmount" type="number" min="0" step="0.01" label="Minimum order (₹)"
                defaultValue={coupon?.minOrderAmount ?? ''} error={errors.minOrderAmount} hint="Cart subtotal before the discount." />
              <AdminField id="expiresOn" name="expiresOn" type="date" label="Expiry date" defaultValue={expiresOn}
                error={errors.expiresOn} hint="Works until the end of this day (India time)." />
              <AdminField id="usageLimit" name="usageLimit" type="number" min="1" step="1" label="Total usage limit"
                defaultValue={coupon?.usageLimit ?? ''} error={errors.usageLimit} hint="Across all customers." />
              <AdminField id="usageLimitPerCustomer" name="usageLimitPerCustomer" type="number" min="1" step="1" label="Uses per customer"
                defaultValue={coupon?.usageLimitPerCustomer ?? ''} error={errors.usageLimitPerCustomer}
                hint="Counted by account and by email address." />
            </fieldset>
          </AdminCard>
        </div>

        <div className="flex flex-col gap-4">
          <AdminCard title="Status">
            <AdminToggle id="coupon-active" label="Active" checked={active} onChange={locked ? undefined : setActive}
              hint={active ? 'Customers can apply this code.' : 'Disabled: the code is refused at checkout.'} />
          </AdminCard>
          {aside}
        </div>
      </div>

      {locked ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton type="submit" variant="primary" size="md" icon={Save} disabled={pending}>
            {pending ? 'Saving…' : coupon ? 'Save changes' : 'Create coupon'}
          </AdminButton>
          <Link href="/admin/coupons" className="text-admin-sm font-medium text-body underline underline-offset-2 hover:text-ink">Cancel</Link>
        </div>
      )}
    </form>
  )
}
