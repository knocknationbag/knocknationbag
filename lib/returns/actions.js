'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAccount } from '@/lib/auth/account'
import { getMyOrder, getOrderByToken } from '@/lib/db/orders'
import { RETURN_CONDITIONS, RETURN_ERRORS, RETURN_REASONS } from '@/constants/returns'

/**
 * "Return Order", from the account order page or the guest order page.
 *
 * Ownership is proven before anything is written: a signed-in customer's
 * order is read through RLS (only its owner gets a row); a guest must hold
 * the order's unguessable access token — the same proof that shows them the
 * order at all. Eligibility (delivered, within 7 days, domestic, paid,
 * quantities left) is then decided by create_return_request() in the
 * database, so nothing the browser sends can widen it.
 */

const fail = (error) => ({ ok: false, error })

function readItems(formData, order) {
  return order.items
    .map((item) => ({ order_item_id: item.id, quantity: Number(formData.get(`qty_${item.id}`) ?? 0) }))
    .filter((line) => Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 99)
}

function friendly(message = '') {
  const code = message.split(':')[0]
  if (code === 'ALREADY_REQUESTED' && message.includes(':')) return `A return has already been requested for ${message.slice(18)}.`
  return RETURN_ERRORS[code] ?? 'We could not send your return request. Please try again.'
}

export async function requestReturn(_prevState, formData) {
  const token = String(formData.get('accessToken') ?? '')
  const orderNumber = String(formData.get('orderNumber') ?? '')

  let order = null
  let userId = null
  if (orderNumber) {
    const account = await getAccount()
    if (account.status === 'guest') return fail('Please sign in to return this order.')
    order = await getMyOrder(orderNumber)
    userId = account.id
  } else if (token) {
    order = await getOrderByToken(token)
  }
  if (!order) return fail(RETURN_ERRORS.ORDER_NOT_FOUND)

  const reason = String(formData.get('reason') ?? '')
  if (!RETURN_REASONS[reason]) return fail(RETURN_ERRORS.INVALID_REASON)
  const confirmed = RETURN_CONDITIONS.every((_, i) => formData.get(`condition_${i}`) === 'on')
  if (!confirmed) return fail(RETURN_ERRORS.CONDITIONS_NOT_CONFIRMED)
  const items = readItems(formData, order)
  if (!items.length) return fail(RETURN_ERRORS.NO_ITEMS)
  const details = String(formData.get('details') ?? '').trim().slice(0, 1000)

  const { data, error } = await createAdminClient().rpc('create_return_request', {
    p_order_id: order.id,
    p_user_id: userId,
    p_items: items,
    p_reason: reason,
    p_details: details || null,
    p_conditions_confirmed: true,
  })
  if (error || !data?.[0]) return fail(friendly(error?.message))

  revalidatePath(`/account/orders/${order.number}`)
  revalidatePath(`/order/${order.accessToken}`)
  revalidatePath('/admin/returns')
  return { ok: true, returnNumber: data[0].return_number }
}
