'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { readAddress, toOrderAddress, validateAddress, normalisePhone } from '@/lib/checkout/validation'

/**
 * The customer's own profile and saved addresses.
 *
 * Everything goes through the session client, so RLS ("addresses: own",
 * "profiles: update own") is what limits a customer to their own rows — and
 * the profiles guard trigger stops them touching admin-only columns.
 */

const fail = (error, fieldErrors = {}, values = {}) => ({ ok: false, error, fieldErrors, values })

async function currentUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return { supabase, user: data?.user ?? null }
}

export async function saveAddress(_prevState, formData) {
  const { supabase, user } = await currentUser()
  if (!user) return fail('Please sign in again.')

  const id = String(formData.get('id') ?? '')
  const address = readAddress(formData)
  const values = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string'))
  const fieldErrors = validateAddress(address)
  if (Object.keys(fieldErrors).length) return fail('Please check the highlighted fields.', fieldErrors, values)

  const row = toOrderAddress(address)
  const { count } = await supabase.from('addresses').select('id', { count: 'exact', head: true })
  const makeDefault = formData.get('isDefault') === 'on' || !count

  if (makeDefault) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id).eq('is_default', true)

  const { error } = id
    ? await supabase.from('addresses').update({ ...row, ...(makeDefault ? { is_default: true } : {}) }).eq('id', id)
    : await supabase.from('addresses').insert({ ...row, user_id: user.id, is_default: makeDefault })
  if (error) return fail('Could not save the address. Please try again.', {}, values)

  revalidatePath('/account')
  return { ok: true }
}

export async function deleteAddress(id) {
  const { supabase, user } = await currentUser()
  if (!user) return { ok: false }
  const { data } = await supabase.from('addresses').delete().eq('id', id).select('is_default')
  // Keep one default if any address is left.
  if (data?.[0]?.is_default) {
    const { data: next } = await supabase.from('addresses').select('id').order('created_at').limit(1)
    if (next?.[0]) await supabase.from('addresses').update({ is_default: true }).eq('id', next[0].id)
  }
  revalidatePath('/account')
  return { ok: true }
}

export async function setDefaultAddress(id) {
  const { supabase, user } = await currentUser()
  if (!user) return { ok: false }
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id).eq('is_default', true)
  await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  revalidatePath('/account')
  return { ok: true }
}

export async function updateProfile(_prevState, formData) {
  const { supabase, user } = await currentUser()
  if (!user) return fail('Please sign in again.')

  const fullName = String(formData.get('fullName') ?? '').trim().replace(/\s+/g, ' ')
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const values = { fullName, phone: phoneInput }
  const fieldErrors = {}
  if (!fullName) fieldErrors.fullName = 'Enter your name.'
  else if (fullName.length > 100) fieldErrors.fullName = 'Keep your name under 100 characters.'
  const phone = phoneInput ? normalisePhone(phoneInput) : null
  if (phoneInput && !phone) fieldErrors.phone = 'Enter a 10-digit Indian mobile number.'
  if (Object.keys(fieldErrors).length) return fail('Please check the highlighted fields.', fieldErrors, values)

  const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
  if (error) return fail('Could not save your details. Please try again.', {}, values)

  revalidatePath('/account')
  return { ok: true, values }
}
