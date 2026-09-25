'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, updateTag } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { loadCart } from '@/lib/cart'
import { paymentOptionsFor } from '@/lib/payments'
import { isOnlinePaymentConfigured } from '@/lib/payments/razorpay'
import { readAddress, toOrderAddress, validateAddress, validateEmail } from './validation'

/**
 * Places an order from the visitor's cart.
 *
 * The browser sends only who the customer is, where to deliver and how they
 * will pay. Prices, shipping, GST and totals are recomputed here from the
 * database (loadCart), and create_order() re-checks stock under row locks in
 * the same transaction that writes the order — so an order can never be
 * placed for a price the customer was not shown or for stock that is gone.
 *
 * Payment:
 *   cod    → payment_status "cod_pending", stock deducted now (the order is a
 *            commitment; the courier collects cash on delivery).
 *   online → payment_status "pending", stock NOT deducted. The order is saved
 *            and Razorpay Checkout opens in the browser; the order becomes
 *            "paid" (and stock is taken) only after the payment is verified on
 *            the server — lib/payments. The cart is kept until then, so a
 *            customer who abandons payment still has it.
 */

const fail = (error, fieldErrors = {}, values = {}) => ({ ok: false, error, fieldErrors, values })

function friendlyOrderError(message = '') {
  if (message.startsWith('OUT_OF_STOCK:')) return `Sorry — ${message.slice(13)} just sold out or has too little stock left. Please review your cart.`
  if (message.startsWith('UNAVAILABLE:')) return `Sorry — ${message.slice(12)} is no longer available. Please review your cart.`
  if (message === 'EMPTY_ORDER') return 'Your cart is empty.'
  return 'We could not place your order. Please try again.'
}

export async function placeOrder(_prevState, formData) {
  const values = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string'))
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const paymentMethod = String(formData.get('paymentMethod') ?? 'cod')
  const note = String(formData.get('note') ?? '').trim().slice(0, 500)
  const billingSame = formData.get('billingSame') === 'on'
  const savedAddressId = String(formData.get('savedAddressId') ?? '')

  const cart = await loadCart()
  if (cart.loadError) return fail('We could not load your cart just now. Please try again in a moment.', {}, values)
  if (!cart.lines.length) return fail('Your cart is empty.', {}, values)
  if (!cart.canCheckout) return fail('Some items in your cart need attention. Please review your cart.', {}, values)

  const { userId } = cart.shopper
  const supabase = await createClient()

  // A signed-in customer may deliver to a saved address — read through RLS,
  // so only their own addresses can be used.
  let shipping = readAddress(formData)
  if (userId && savedAddressId) {
    const { data: saved } = await supabase.from('addresses').select('*').eq('id', savedAddressId).maybeSingle()
    if (!saved) return fail('That saved address could not be found.', {}, values)
    shipping = {
      fullName: saved.full_name, phone: saved.phone, line1: saved.line1, line2: saved.line2 ?? '',
      city: saved.city, state: saved.state, pincode: saved.pincode, country: 'India',
    }
  }
  const billing = billingSame ? null : readAddress(formData, 'billing_')

  const fieldErrors = {
    ...(validateEmail(email) ? { email: validateEmail(email) } : {}),
    ...validateAddress(shipping),
    ...(billing ? validateAddress(billing, 'billing_') : {}),
  }
  if (Object.keys(fieldErrors).length) return fail('Please check the highlighted fields.', fieldErrors, values)

  const online = paymentMethod === 'online'
  if (!online && paymentMethod !== 'cod') return fail('Choose how you would like to pay.', {}, values)
  if (!online && !cart.settings.codEnabled) return fail('Cash on Delivery is not available right now.', {}, values)
  if (online && !isOnlinePaymentConfigured()) return fail('Online payment is not available right now. Please choose Cash on Delivery.', {}, values)

  const { totals, lines } = cart
  const order = {
    user_id: userId,
    customer_name: shipping.fullName,
    email,
    phone: toOrderAddress(shipping).phone,
    shipping_address: toOrderAddress(shipping),
    billing_address: billing ? toOrderAddress(billing) : null,
    payment_method: online ? 'online' : 'cod',
    payment_status: online ? 'pending' : 'cod_pending',
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping_fee: totals.shippingFee,
    gst_rate: totals.gstRate,
    gst_amount: totals.gstAmount,
    prices_include_gst: totals.pricesIncludeGst,
    total: totals.total,
    is_wholesale: lines.some((line) => line.isWholesalePrice),
    customer_note: note,
  }
  const items = lines.map((line) => ({
    product_id: line.productId,
    variant_id: line.variantId,
    product_name: line.name,
    product_slug: line.slug,
    variant_label: line.variantLabel,
    sku: line.sku || null,
    image_url: line.image,
    unit_price: line.unitPrice,
    quantity: line.quantity,
    line_total: line.lineTotal,
    is_wholesale_price: line.isWholesalePrice,
  }))

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('create_order', { p_order: order, p_items: items, p_deduct_stock: !online })
  if (error || !data?.[0]) return fail(friendlyOrderError(error?.message), {}, values)
  const placed = data[0]

  // The order is safe; tidy-up below must not turn success into an error.
  if (userId && !savedAddressId && formData.get('saveAddress') === 'on') {
    const { count } = await supabase.from('addresses').select('id', { count: 'exact', head: true })
    await supabase.from('addresses').insert({ user_id: userId, ...toOrderAddress(shipping), is_default: !count })
  }

  if (online) {
    // Saved as "awaiting payment". Open Razorpay; the cart stays until paid.
    const { data: row } = await admin.from('orders').select('*').eq('id', placed.order_id).single()
    try {
      return { ok: true, payment: await paymentOptionsFor(row), values }
    } catch {
      return { ...fail('Your order is saved, but the payment window could not be opened. You can pay from your order page.', {}, values), orderUrl: `/order/${placed.access_token}` }
    }
  }

  await admin.from('cart_items').delete().eq('cart_id', cart.id)

  // Stock changed: the shop's cached availability must follow.
  updateTag(CATALOG_TAG)
  revalidatePath('/admin/orders')
  redirect(`/order/${placed.access_token}`)
}
