'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { friendlyDbError } from '@/lib/db/errors'
import { COUPON_CODE_PATTERN, COUPON_TYPES, normaliseCouponCode } from '@/constants/coupons'

/**
 * Coupon management. Every action re-checks the permission (the proxy does
 * not cover POSTs) and RLS re-checks the admin role on the write. Values are
 * validated here and again by the table's check constraints.
 */

const CONSTRAINTS = {
  coupons_code_key: 'A coupon with this code already exists.',
  coupons_code_format: 'Codes are 3–32 letters, numbers, hyphens or underscores.',
  coupons_value_check: 'Enter a valid discount value for this coupon type.',
}

const fail = (error, fieldErrors = {}) => ({ ok: false, error, fieldErrors })
const blank = (value) => value === null || value === undefined || String(value).trim() === ''

function refresh(id) {
  revalidatePath('/admin/coupons')
  if (id) revalidatePath(`/admin/coupons/${id}`)
}

/** "2026-12-31" → the last moment of that day in India. */
function endOfIndianDay(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T23:59:59.999+05:30` : null
}

function readCoupon(formData) {
  const text = (key) => String(formData.get(key) ?? '').trim()
  const fieldErrors = {}

  const code = normaliseCouponCode(text('code'))
  if (!COUPON_CODE_PATTERN.test(code)) fieldErrors.code = 'Use 3–32 letters, numbers, hyphens or underscores (e.g. SAVE10).'

  const type = text('type')
  if (!COUPON_TYPES[type]) fieldErrors.type = 'Choose a coupon type.'

  const value = Number(text('value'))
  if (type === 'percentage' && (!Number.isFinite(value) || value <= 0 || value > 100)) fieldErrors.value = 'Enter a percentage between 1 and 100.'
  if (type === 'flat' && (!Number.isFinite(value) || value <= 0)) fieldErrors.value = 'Enter the discount amount in rupees.'

  const money = (key, label, { positive = false } = {}) => {
    if (blank(formData.get(key))) return null
    const amount = Number(text(key))
    if (!Number.isFinite(amount) || amount < 0 || (positive && amount === 0)) fieldErrors[key] = `Enter a valid ${label}.`
    return Math.round(amount * 100) / 100
  }
  const count = (key) => {
    if (blank(formData.get(key))) return null
    const n = Number(text(key))
    if (!Number.isInteger(n) || n < 1) fieldErrors[key] = 'Enter a whole number of 1 or more, or leave it empty for no limit.'
    return n
  }

  const minOrderAmount = money('minOrderAmount', 'minimum order amount')
  const maxDiscountAmount = type === 'percentage' ? money('maxDiscountAmount', 'maximum discount', { positive: true }) : null
  const usageLimit = count('usageLimit')
  const usageLimitPerCustomer = count('usageLimitPerCustomer')
  if (usageLimit && usageLimitPerCustomer && usageLimitPerCustomer > usageLimit) {
    fieldErrors.usageLimitPerCustomer = 'Cannot be more than the total usage limit.'
  }

  const expiresOn = text('expiresOn')
  const expiresAt = expiresOn ? endOfIndianDay(expiresOn) : null
  if (expiresOn && !expiresAt) fieldErrors.expiresOn = 'Choose a valid date.'

  const description = text('description')
  if (description.length > 200) fieldErrors.description = 'Keep the note under 200 characters.'

  return {
    fieldErrors,
    row: {
      code,
      description: description || null,
      discount_type: type,
      discount_value: type === 'free_shipping' ? 0 : Math.round(value * 100) / 100,
      min_order_amount: minOrderAmount,
      max_discount_amount: maxDiscountAmount,
      expires_at: expiresAt,
      usage_limit: usageLimit,
      usage_limit_per_customer: usageLimitPerCustomer,
      is_active: formData.get('isActive') === 'on',
    },
  }
}

export async function saveCoupon(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)

  const id = String(formData.get('id') ?? '') || null
  const { row, fieldErrors } = readCoupon(formData)
  if (Object.keys(fieldErrors).length) return fail('Check the highlighted fields.', fieldErrors)

  const supabase = await createClient()
  const result = id
    ? await supabase.from('coupons').update(row).eq('id', id).is('archived_at', null).select('id').maybeSingle()
    : await supabase.from('coupons').insert(row).select('id').single()

  if (result.error) {
    const message = friendlyDbError(result.error, CONSTRAINTS)
    return fail(message, result.error.code === '23505' ? { code: message } : {})
  }
  if (!result.data) return fail('This coupon could not be saved. Archived coupons cannot be edited.')

  refresh(result.data.id)
  return { ok: true, id: result.data.id, created: !id }
}

/** Enable / disable from the list or the edit screen. */
export async function setCouponActive(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const id = String(formData.get('id') ?? '')
  const active = formData.get('active') === 'true'

  const supabase = await createClient()
  const { error } = await supabase.from('coupons').update({ is_active: active }).eq('id', id).is('archived_at', null)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))
  refresh(id)
  return { ok: true }
}

/**
 * Archive: the coupon stops working and leaves the default list, but stays on
 * record because orders reference it. Used coupons can only be archived.
 */
export async function archiveCoupon(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const id = String(formData.get('id') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.from('coupons').update({ archived_at: new Date().toISOString(), is_active: false }).eq('id', id)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))
  refresh(id)
  return { ok: true }
}

/** Hard delete, only for a coupon no order has ever used (the FK refuses otherwise). */
export async function deleteCoupon(_prevState, formData) {
  await requirePermission(PERMISSIONS.ORDERS_EDIT)
  const id = String(formData.get('id') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') return fail('This coupon has been used on orders, so it cannot be deleted. Archive it instead.')
    return fail(friendlyDbError(error, CONSTRAINTS))
  }
  refresh()
  return { ok: true }
}
