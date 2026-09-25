'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { saveStoreSettings } from '@/lib/actions/settings'
import { computeTotals } from '@/lib/checkout/pricing'
import { formatPrice } from '@/utils/formatPrice'

/**
 * Shipping, GST and Cash on Delivery — the only settings V1 needs. The
 * example at the bottom runs the real pricing rules on a sample cart so the
 * owner sees what a customer will be charged before saving.
 */
export default function StoreSettingsForm({ settings }) {
  const [state, formAction, pending] = useActionState(saveStoreSettings, { ok: false, fieldErrors: {}, values: {} })
  const errors = state.fieldErrors ?? {}

  const [shippingFee, setShippingFee] = useState(String(settings.shippingFee))
  const [threshold, setThreshold] = useState(settings.freeShippingThreshold === null ? '' : String(settings.freeShippingThreshold))
  const [gstEnabled, setGstEnabled] = useState(settings.gstEnabled)
  const [gstRate, setGstRate] = useState(String(settings.gstRate))
  const [inclusive, setInclusive] = useState(settings.pricesIncludeGst)
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled)

  const preview = (subtotal) => computeTotals([{ lineTotal: subtotal, quantity: 1 }], {
    shippingFee: Number(shippingFee) || 0,
    freeShippingThreshold: threshold === '' ? null : Number(threshold),
    gstEnabled,
    gstRate: Number(gstRate) || 0,
    pricesIncludeGst: inclusive,
  })

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {gstEnabled ? <input type="hidden" name="gstEnabled" value="on" /> : null}
      {codEnabled ? <input type="hidden" name="codEnabled" value="on" /> : null}
      <input type="hidden" name="pricesIncludeGst" value={inclusive ? 'inclusive' : 'exclusive'} />

      {state.error ? <AuthMessage tone="error">{state.error}</AuthMessage> : null}
      {state.ok ? <AuthMessage tone="success">Settings saved. The cart and checkout use them straight away.</AuthMessage> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard title="Shipping" description="One flat fee per order, free above an order value you choose.">
          <div className="grid gap-3.5 md:grid-cols-2">
            <AdminField id="shippingFee" name="shippingFee" type="number" min="0" step="1" label="Shipping fee (₹)" required
              value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} error={errors.shippingFee} />
            <AdminField id="freeShippingThreshold" name="freeShippingThreshold" type="number" min="0" step="1" label="Free shipping from (₹)"
              value={threshold} onChange={(e) => setThreshold(e.target.value)} error={errors.freeShippingThreshold}
              hint="Order subtotal. Leave empty to always charge shipping." />
          </div>
        </AdminCard>

        <AdminCard title="GST" description="How GST is shown and charged at checkout.">
          <div className="flex flex-col gap-3.5">
            <AdminToggle id="gstEnabled" label="Charge / show GST" checked={gstEnabled} onChange={setGstEnabled}
              hint={gstEnabled ? 'GST appears in the cart and on orders.' : 'No GST line at checkout.'} />
            {gstEnabled ? (
              <div className="grid gap-3.5 md:grid-cols-2">
                <AdminField id="gstRate" name="gstRate" type="number" min="0" max="100" step="0.01" label="GST rate (%)"
                  value={gstRate} onChange={(e) => setGstRate(e.target.value)} error={errors.gstRate} />
                <AdminField id="gstMode" as="select" label="Product prices are" value={inclusive ? 'inclusive' : 'exclusive'}
                  onChange={(e) => setInclusive(e.target.value === 'inclusive')}
                  hint={inclusive ? 'GST is already inside the price; it is shown, not added.' : 'GST is added on top at checkout.'}>
                  <option value="inclusive">Including GST</option>
                  <option value="exclusive">Excluding GST</option>
                </AdminField>
              </div>
            ) : <input type="hidden" name="gstRate" value={gstRate} />}
          </div>
        </AdminCard>

        <AdminCard title="Payment methods">
          <AdminToggle id="codEnabled" label="Cash on Delivery" checked={codEnabled} onChange={setCodEnabled}
            hint="Customers pay the courier in cash. The order counts as paid once you mark it Delivered." />
          <p className="mt-3 text-admin-sm text-muted">Online payment (Razorpay) is added in the next phase.</p>
        </AdminCard>

        <AdminCard title="Example" description="What a customer pays with these settings (not saved yet).">
          <table className="w-full text-admin">
            <thead className="text-admin-xs uppercase tracking-wide text-body">
              <tr><th className="py-1 text-left font-semibold">Items</th><th className="py-1 text-right font-semibold">Shipping</th><th className="py-1 text-right font-semibold">GST</th><th className="py-1 text-right font-semibold">Total</th></tr>
            </thead>
            <tbody>
              {[999, 2499].map((subtotal) => {
                const t = preview(subtotal)
                return (
                  <tr key={subtotal} className="border-t border-border">
                    <td className="py-1.5">{formatPrice(subtotal)}</td>
                    <td className="py-1.5 text-right">{t.shippingFee ? formatPrice(t.shippingFee) : 'Free'}</td>
                    <td className="py-1.5 text-right">{t.gstRate ? `${formatPrice(t.gstAmount)}${t.pricesIncludeGst ? ' incl.' : ''}` : '—'}</td>
                    <td className="py-1.5 text-right font-semibold text-ink">{formatPrice(t.total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </AdminCard>
      </div>

      <div>
        <AdminButton type="submit" variant="primary" size="md" icon={Save} disabled={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </AdminButton>
      </div>
    </form>
  )
}
