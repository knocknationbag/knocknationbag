import Link from 'next/link'
import { Lock } from 'lucide-react'

import Container from '@/components/layout/Container'
import Breadcrumb from '@/components/common/Breadcrumb'
import CartLineItem from '@/components/common/CartLineItem'
import OrderSummary from '@/components/common/OrderSummary'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import { cartItems, SHIPPING_METHODS } from '@/data/account'
import { cn } from '@/utils/cn'

export const metadata = {
  title: 'Checkout',
  description: 'Complete your Knock Nation Bag order.',
  robots: { index: false, follow: false },
}

const STEPS = ['Address', 'Shipping', 'Payment', 'Review']

function StepIndicator({ current = 0 }) {
  return (
    <ol className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2">
      {STEPS.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming'
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                'grid size-7 place-items-center rounded-full text-[13px] font-bold',
                state === 'current' && 'bg-ink text-white',
                state === 'done' && 'bg-gold text-ink',
                state === 'upcoming' && 'border border-border text-body',
              )}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span
              className={cn('text-[14px]', state === 'upcoming' ? 'text-body' : 'font-semibold text-ink')}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {step}
            </span>
            {i < STEPS.length - 1 ? <span className="hidden h-px w-8 bg-border sm:block" aria-hidden="true" /> : null}
          </li>
        )
      })}
    </ol>
  )
}

export default function CheckoutPage() {
  return (
    <Container className="py-8 md:py-12 xl:py-16">
      <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} className="mb-6" />

      <h1 className="text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">Checkout</h1>
      <p className="mt-3 flex items-center gap-2 text-[14px] text-body">
        <Lock size={15} className="text-gold" aria-hidden="true" />
        This is a static demonstration — no payment is taken and no data is submitted.
      </p>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
        <div>
          <StepIndicator current={0} />

          <form className="flex flex-col gap-10">
            <section aria-labelledby="step-contact">
              <h2 id="step-contact" className="text-[18px] font-bold text-ink">Contact</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field id="co-email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@example.com" />
                <Field id="co-phone" name="phone" type="tel" label="Telephone" autoComplete="tel" placeholder="+1 (555) 000 0000" />
              </div>
            </section>

            <section aria-labelledby="step-address">
              <h2 id="step-address" className="text-[18px] font-bold text-ink">Delivery address</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field id="co-first" name="firstName" label="First name" autoComplete="given-name" />
                <Field id="co-last" name="lastName" label="Last name" autoComplete="family-name" />
                <Field id="co-line1" name="line1" label="Address" autoComplete="address-line1" className="md:col-span-2" />
                <Field id="co-line2" name="line2" label="Apartment, suite (optional)" autoComplete="address-line2" className="md:col-span-2" />
                <Field id="co-city" name="city" label="City" autoComplete="address-level2" />
                <Field id="co-postcode" name="postcode" label="Postal code" autoComplete="postal-code" />
                <Field id="co-country" name="country" as="select" label="Country" autoComplete="country-name" className="md:col-span-2" defaultValue="US">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="PT">Portugal</option>
                  <option value="AU">Australia</option>
                </Field>
              </div>
            </section>

            <section aria-labelledby="step-shipping">
              <h2 id="step-shipping" className="text-[18px] font-bold text-ink">Shipping method</h2>
              <fieldset className="mt-5">
                <legend className="sr-only">Choose a shipping method</legend>
                <div className="flex flex-col gap-3">
                  {SHIPPING_METHODS.map((method, i) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-center gap-4 rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover has-[:checked]:border-ink"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        defaultChecked={i === 0}
                        className="size-4 accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      />
                      <span className="flex-1">
                        <span className="block text-[15px] font-bold text-ink">{method.label}</span>
                        <span className="block text-[14px] text-body">{method.detail}</span>
                      </span>
                      <span className="text-[15px] font-bold text-ink">
                        {method.price === 0 ? 'Free' : `$${method.price}`}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <section aria-labelledby="step-payment">
              <h2 id="step-payment" className="text-[18px] font-bold text-ink">Payment</h2>
              <p className="mt-2 text-[14px] text-body">
                Card fields are shown for layout only. A real integration would render hosted
                fields here so card data never touches this application.
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field id="co-card" name="card" label="Card number" placeholder="0000 0000 0000 0000" inputMode="numeric" className="md:col-span-2" disabled />
                <Field id="co-exp" name="exp" label="Expiry" placeholder="MM / YY" disabled />
                <Field id="co-cvc" name="cvc" label="Security code" placeholder="123" disabled />
              </div>
            </section>

            <div className="flex flex-wrap gap-4">
              <Button href="/checkout/success" variant="primary" size="lg">Place order</Button>
              <Button href="/cart" variant="secondary" size="lg">Back to cart</Button>
            </div>

            <p className="text-[13px] text-body">
              By placing an order you agree to our{' '}
              <Link href="/terms" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">privacy policy</Link>.
            </p>
          </form>
        </div>

        <div className="h-fit">
          <OrderSummary items={cartItems}>
            <ul className="mt-6 divide-y divide-border border-t border-border">
              {cartItems.map((item) => (
                <CartLineItem key={item.slug} item={item} readOnly className="!py-4" />
              ))}
            </ul>
          </OrderSummary>
        </div>
      </div>
    </Container>
  )
}
