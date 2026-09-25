'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { requireDashboardUser } from '@/lib/auth/session'

/** Shipping, GST and Cash on Delivery settings. RLS allows admins only. */
export async function saveStoreSettings(_prevState, formData) {
  await requireDashboardUser()

  const text = (key) => String(formData.get(key) ?? '').trim()
  const money = (key) => (text(key) === '' ? null : Number(text(key)))
  const values = Object.fromEntries(['shippingFee', 'freeShippingThreshold', 'gstRate'].map((k) => [k, text(k)]))

  const shippingFee = money('shippingFee')
  const threshold = money('freeShippingThreshold')
  const gstRate = money('gstRate')
  const gstEnabled = formData.get('gstEnabled') === 'on'

  const fieldErrors = {}
  if (shippingFee === null || Number.isNaN(shippingFee) || shippingFee < 0) fieldErrors.shippingFee = 'Enter a shipping fee of ₹0 or more.'
  if (threshold !== null && (Number.isNaN(threshold) || threshold < 0)) fieldErrors.freeShippingThreshold = 'Enter an amount, or leave empty to never make shipping free.'
  if (gstEnabled && (gstRate === null || Number.isNaN(gstRate) || gstRate < 0 || gstRate > 100)) fieldErrors.gstRate = 'Enter a GST rate between 0 and 100.'
  if (Object.keys(fieldErrors).length) return { ok: false, error: 'Please check the highlighted fields.', fieldErrors, values }

  const supabase = await createClient()
  const { data, error } = await supabase.from('store_settings').update({
    shipping_fee: shippingFee,
    free_shipping_threshold: threshold,
    gst_enabled: gstEnabled,
    gst_rate: Number.isFinite(gstRate) ? gstRate : 0,
    prices_include_gst: formData.get('pricesIncludeGst') === 'inclusive',
    cod_enabled: formData.get('codEnabled') === 'on',
  }).eq('id', 1).select('id')
  if (error) return { ok: false, error: 'Could not save the settings.', fieldErrors: {}, values }
  // RLS silently matches no row for a non-admin role — say so rather than pretend.
  if (!data?.length) return { ok: false, error: 'Your account is not permitted to change shop settings.', fieldErrors: {}, values }

  revalidatePath('/admin/settings')
  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { ok: true, fieldErrors: {}, values }
}
