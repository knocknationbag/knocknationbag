'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Banknote, CreditCard, Lock } from 'lucide-react'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import AuthNotice from '@/components/auth/AuthNotice'
import AddressFields from './AddressFields'
import { openRazorpayCheckout } from './razorpayCheckout'
import { placeOrder } from '@/lib/checkout/actions'
import { formatAddress } from '@/lib/checkout/validation'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const INITIAL = { ok: false, error: null, fieldErrors: {}, values: {} }

const OPTION = 'flex cursor-pointer items-start gap-4 rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover has-[:checked]:border-ink'
const RADIO = 'mt-1 size-4 shrink-0 accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

/**
 * One-page checkout: contact → delivery → billing → payment → place order.
 * Sends only customer details; the server prices the order itself.
 */
export default function CheckoutForm({ defaults = {}, savedAddresses = [], signedIn = false, codEnabled = true, onlineEnabled = false, total }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(placeOrder, INITIAL)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState(null)
  const openedFor = useRef(null)

  // Online: the order is saved; open Razorpay once per placed order. Success
  // is decided on the server (verifyPayment); anything else lands on the order
  // page, which offers "Pay now" — so a retry never creates a second order.
  useEffect(() => {
    const payment = state.payment
    if (!payment || openedFor.current === payment.orderId) return
    openedFor.current = payment.orderId
    setPaying(true)
    openRazorpayCheckout(payment, { onFailedAttempt: (text) => setPayError(`${text} You can try another method.`) })
      .then((result) => router.push(result.status === 'paid' ? result.redirectTo : `/order/${payment.accessToken}`))
  }, [state.payment, router])
  const busy = pending || paying
  const nothingAvailable = !codEnabled && !onlineEnabled
  const values = { ...defaults, ...state.values }
  const errors = state.fieldErrors ?? {}

  const defaultSaved = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0]
  const [addressChoice, setAddressChoice] = useState(values.savedAddressId ?? defaultSaved?.id ?? 'new')
  const [billingSame, setBillingSame] = useState(values.billingSame !== undefined ? values.billingSame === 'on' : true)
  const usingSaved = addressChoice !== 'new'

  return (
    <form action={formAction} className="flex flex-col gap-10" noValidate>
      {state.error ? (
        <AuthNotice tone="error">
          {state.error}
          {state.orderUrl ? <> <Link href={state.orderUrl} className="font-semibold underline underline-offset-4">Go to your order</Link></> : null}
        </AuthNotice>
      ) : null}
      {paying ? <AuthNotice tone="info">Complete the payment in the Razorpay window. Don&apos;t close this page.</AuthNotice> : null}
      {payError ? <AuthNotice tone="error">{payError}</AuthNotice> : null}

      <section aria-labelledby="co-contact">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="co-contact" className="text-[18px] font-bold text-ink">Contact</h2>
          {signedIn ? null : (
            <p className="text-[14px] text-body">
              Have an account?{' '}
              <Link href="/login?next=/checkout" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">Sign in</Link>
              {' '}— or continue as a guest.
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field id="co-email" name="email" type="email" label="Email address" autoComplete="email"
            placeholder="you@example.com" defaultValue={values.email ?? ''} error={errors.email} required
            hint="For your order confirmation." />
        </div>
      </section>

      <section aria-labelledby="co-address">
        <h2 id="co-address" className="text-[18px] font-bold text-ink">Delivery address</h2>

        {savedAddresses.length ? (
          <fieldset className="mt-5 flex flex-col gap-3">
            <legend className="sr-only">Choose a delivery address</legend>
            {savedAddresses.map((a) => (
              <label key={a.id} className={OPTION}>
                <input type="radio" name="savedAddressId" value={a.id} checked={addressChoice === a.id}
                  onChange={() => setAddressChoice(a.id)} className={RADIO} />
                <span className="text-[15px] text-body">
                  <span className="block font-bold text-ink">{a.full_name}{a.is_default ? ' · Default' : ''}</span>
                  {formatAddress(a)} · {a.phone}
                </span>
              </label>
            ))}
            <label className={OPTION}>
              <input type="radio" name="savedAddressId" value="" checked={!usingSaved}
                onChange={() => setAddressChoice('new')} className={RADIO} />
              <span className="text-[15px] font-bold text-ink">Deliver to a new address</span>
            </label>
          </fieldset>
        ) : null}

        {usingSaved ? null : (
          <div className="mt-5">
            <AddressFields values={values} errors={errors} idPrefix="ship" />
            {signedIn ? (
              <label className="mt-4 flex items-center gap-2.5 text-[14px] text-body">
                <input type="checkbox" name="saveAddress" defaultChecked className="size-4 accent-[#111827]" />
                Save this address to my account
              </label>
            ) : null}
          </div>
        )}
      </section>

      <section aria-labelledby="co-billing">
        <h2 id="co-billing" className="text-[18px] font-bold text-ink">Billing address</h2>
        <label className="mt-4 flex items-center gap-2.5 text-[15px] text-ink">
          <input type="checkbox" name="billingSame" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)}
            className="size-4 accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold" />
          Same as delivery address
        </label>
        {billingSame ? null : (
          <div className="mt-5">
            <AddressFields prefix="billing_" values={values} errors={errors} idPrefix="bill" />
          </div>
        )}
      </section>

      <section aria-labelledby="co-payment">
        <h2 id="co-payment" className="text-[18px] font-bold text-ink">Payment</h2>
        <fieldset className="mt-5 flex flex-col gap-3">
          <legend className="sr-only">Choose how to pay</legend>
          <label className={cn(OPTION, !codEnabled && 'cursor-not-allowed opacity-60')}>
            <input type="radio" name="paymentMethod" value="cod" defaultChecked={codEnabled} disabled={!codEnabled} className={RADIO} />
            <Banknote size={22} className="shrink-0 text-gold" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-ink">Cash on Delivery</span>
              <span className="block text-[14px] text-body">
                {codEnabled ? `Pay ${formatPrice(total)} in cash when your order arrives.` : 'Not available right now.'}
              </span>
            </span>
          </label>
          <label className={cn(OPTION, !onlineEnabled && 'cursor-not-allowed opacity-60')}>
            <input type="radio" name="paymentMethod" value="online" disabled={!onlineEnabled}
              defaultChecked={onlineEnabled && !codEnabled} className={RADIO} />
            <CreditCard size={22} className="shrink-0 text-gold" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-ink">Pay online</span>
              <span className="block text-[14px] text-body">
                {onlineEnabled ? 'UPI, cards, net banking and wallets — secured by Razorpay.' : 'Not available right now.'}
              </span>
            </span>
          </label>
        </fieldset>
      </section>

      <section aria-labelledby="co-note">
        <h2 id="co-note" className="sr-only">Order note</h2>
        <Field id="co-note-field" name="note" as="textarea" rows={3} label="Order note (optional)"
          maxLength={500} defaultValue={values.note ?? ''} hint="Delivery instructions, a gift message…" />
      </section>

      <div className="flex flex-col gap-4">
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy || nothingAvailable}>
          {paying ? 'Waiting for payment…' : pending ? 'Placing your order…' : `Place order · ${formatPrice(total)}`}
        </Button>
        <p className="flex items-center justify-center gap-2 text-[13px] text-body">
          <Lock size={14} className="text-gold" aria-hidden="true" />
          By placing this order you agree to our{' '}
          <Link href="/terms" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">privacy policy</Link>.
        </p>
      </div>
    </form>
  )
}
