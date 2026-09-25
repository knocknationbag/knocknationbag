import { redirect } from 'next/navigation'

import Container from '@/components/layout/Container'
import Breadcrumb from '@/components/common/Breadcrumb'
import CartLineItem from '@/components/common/CartLineItem'
import OrderSummary from '@/components/common/OrderSummary'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { loadCart } from '@/lib/cart'
import { createClient } from '@/lib/supabase/server'
import { isOnlinePaymentConfigured } from '@/lib/payments/razorpay'

export const metadata = {
  title: 'Checkout',
  description: 'Complete your Knock Nation Bag order.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Guests check out with just an email and address; signed-in customers get
 * their details and saved addresses pre-filled. An empty cart, or one with
 * sold-out items, goes back to the cart to be fixed first.
 */
export default async function CheckoutPage() {
  const cart = await loadCart()
  if (!cart.lines.length || !cart.canCheckout) redirect('/cart')

  const { userId } = cart.shopper
  let defaults = {}
  let savedAddresses = []
  if (userId) {
    const supabase = await createClient()
    const [{ data: profile }, { data: addresses }] = await Promise.all([
      supabase.from('profiles').select('full_name, email, phone').eq('id', userId).maybeSingle(),
      supabase.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at'),
    ])
    defaults = { email: profile?.email ?? '', fullName: profile?.full_name ?? '', phone: profile?.phone ?? '' }
    savedAddresses = addresses ?? []
  }

  return (
    <Container className="py-8 md:py-12 xl:py-16">
      <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} className="mb-6" />
      <h1 className="text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">Checkout</h1>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
        <CheckoutForm
          defaults={defaults}
          savedAddresses={savedAddresses}
          signedIn={Boolean(userId)}
          codEnabled={cart.settings.codEnabled}
          onlineEnabled={isOnlinePaymentConfigured()}
          total={cart.totals.total}
        />

        <div className="h-fit xl:sticky xl:top-28">
          <OrderSummary totals={cart.totals} title="Your order">
            <ul className="mt-6 divide-y divide-border border-t border-border pt-6">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} readOnly className="!py-4" />
              ))}
            </ul>
          </OrderSummary>
        </div>
      </div>
    </Container>
  )
}
