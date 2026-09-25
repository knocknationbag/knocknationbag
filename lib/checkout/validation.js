import { INDIAN_STATES } from '@/constants/india'

/**
 * Address and contact validation, shared by checkout and saved addresses.
 * Pure functions: the server runs them on every submit; forms may mirror them.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** "+91 98765-43210" → "9876543210". Returns null when it is not an Indian mobile number. */
export function normalisePhone(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '').replace(/^(91|0)(?=\d{10}$)/, '')
  return /^[6-9]\d{9}$/.test(digits) ? digits : null
}

export function readAddress(formData, prefix = '') {
  const text = (key) => String(formData.get(`${prefix}${key}`) ?? '').trim().replace(/\s+/g, ' ')
  return {
    fullName: text('fullName'),
    phone: text('phone'),
    line1: text('line1'),
    line2: text('line2'),
    city: text('city'),
    state: text('state'),
    pincode: text('pincode').replace(/\s/g, ''),
    country: 'India',
  }
}

/** Field errors keyed by field name (with prefix), empty when valid. */
export function validateAddress(address, prefix = '') {
  const errors = {}
  const set = (key, message) => { errors[`${prefix}${key}`] = message }
  if (!address.fullName) set('fullName', 'Enter the full name.')
  else if (address.fullName.length > 100) set('fullName', 'Keep the name under 100 characters.')
  if (!normalisePhone(address.phone)) set('phone', 'Enter a 10-digit Indian mobile number.')
  if (!address.line1) set('line1', 'Enter the house number and street.')
  if (address.line1.length > 200 || address.line2.length > 200) set('line1', 'Keep each address line under 200 characters.')
  if (!address.city) set('city', 'Enter the city or town.')
  if (!INDIAN_STATES.includes(address.state)) set('state', 'Choose a state.')
  if (!/^[1-9]\d{5}$/.test(address.pincode)) set('pincode', 'Enter a 6-digit PIN code.')
  return errors
}

export function validateEmail(email) {
  return EMAIL.test(email) ? null : 'Enter a valid email address.'
}

/** The address as stored on an order (snake_case, normalised phone). */
export function toOrderAddress(address) {
  return {
    full_name: address.fullName,
    phone: normalisePhone(address.phone) ?? address.phone,
    line1: address.line1,
    line2: address.line2 || null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: 'India',
  }
}

/** One-line rendering for lists and summaries. */
export function formatAddress(a) {
  if (!a) return ''
  return [a.line1, a.line2, a.city, `${a.state} ${a.pincode}`].filter(Boolean).join(', ')
}
