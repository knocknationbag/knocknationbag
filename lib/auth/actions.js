'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { toAdminUser } from './user'
import { hasDashboardAccess } from './permissions'
import { ADMIN_HOME, ADMIN_LOGIN, ADMIN_UNAUTHORIZED, safeNextPath } from './routes'
import {
  NOT_CONFIGURED_MESSAGE,
  resetErrorMessage,
  signInErrorMessage,
  validateEmail,
  validatePassword,
} from './authErrors'

/**
 * Server Actions for the admin auth screens.
 *
 * Sessions are handled entirely by @supabase/ssr, which stores them in httpOnly
 * cookies. Nothing here reads or writes a token by hand, and nothing touches
 * localStorage — a JWT readable by JavaScript is a JWT any XSS can steal.
 *
 * `redirect()` works by throwing, so these functions deliberately avoid
 * try/catch around it.
 */

const fail = (message, fields = {}) => ({ ok: false, error: message, ...fields })

/**
 * Absolute origin for links Supabase emails out.
 *
 * Derived from the request so local development and preview deploys work with
 * no configuration; NEXT_PUBLIC_SITE_URL overrides it where the app sits behind
 * a proxy that rewrites Host.
 */
async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

export async function signIn(_prevState, formData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = safeNextPath(String(formData.get('next') ?? ''))

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE, { email })

  const emailError = validateEmail(email)
  if (emailError) return fail(emailError, { email })
  if (!password) return fail('Enter your password.', { email })

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return fail(signInErrorMessage(error), { email })

  // Authenticated, but the role decides whether there is anything to see.
  // Checking here means a Customer lands on a page that explains itself rather
  // than flashing the dashboard before the proxy bounces them.
  const user = toAdminUser(data.user)
  revalidatePath('/', 'layout')
  redirect(hasDashboardAccess(user) ? next : ADMIN_UNAUTHORIZED)
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect(ADMIN_LOGIN)
}

export async function requestPasswordReset(_prevState, formData) {
  const email = String(formData.get('email') ?? '').trim()

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE, { email })

  const emailError = validateEmail(email)
  if (emailError) return fail(emailError, { email })

  const supabase = await createClient()
  const origin = await siteOrigin()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/admin/reset-password`,
  })

  // Rate limiting is worth surfacing; "no such account" is not. Reporting
  // whether an address exists would turn this form into a directory of staff
  // email addresses, so the confirmation is identical either way.
  if (error?.code === 'over_email_send_rate_limit' || error?.code === 'over_request_rate_limit') {
    return fail('Too many requests. Wait a minute before trying again.', { email })
  }

  return { ok: true, email }
}

export async function updatePassword(_prevState, formData) {
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE)

  const passwordError = validatePassword(password, confirmation)
  if (passwordError) return fail(passwordError)

  const supabase = await createClient()

  // The recovery link is what signs the user in. No session means they opened
  // this page directly, or the link has already been spent.
  const { data: session } = await supabase.auth.getUser()
  if (!session?.user) {
    return fail('This reset link has expired or has already been used. Request a new one.')
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return fail(resetErrorMessage(error))

  // A password change should end every other session — that is the point of
  // resetting it after a suspected compromise.
  await supabase.auth.signOut({ scope: 'others' })
  revalidatePath('/', 'layout')
  redirect(ADMIN_HOME)
}
