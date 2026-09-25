'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import { siteOrigin } from './origin'
import {
  AUTH_CALLBACK,
  AUTH_CONFIRM,
  CUSTOMER_HOME,
  CUSTOMER_RESET_PASSWORD,
  safeCustomerNextPath,
} from './customerRoutes'
import {
  NOT_CONFIGURED_MESSAGE,
  customerSignInErrorMessage,
  resetErrorMessage,
  signUpErrorMessage,
  validateEmail,
  validateFullName,
  validatePassword,
} from './authErrors'

/**
 * Server Actions for the storefront (customer) auth screens.
 *
 * Same architecture as the admin actions in actions.js — Supabase Auth via
 * @supabase/ssr, sessions in httpOnly cookies, no token ever in client code —
 * but a separate module so customer redirects can never resume an /admin path
 * and admin behaviour cannot change by accident.
 *
 * Supabase does all password handling. Nothing here hashes, stores or logs a
 * password, and no row is ever written to auth.users by hand: the profile row
 * is created by the on_auth_user_created trigger.
 *
 * `redirect()` throws, so it is never wrapped in try/catch.
 */

const fail = (message, fields = {}) => ({ ok: false, error: message, ...fields })

export async function customerSignIn(_prevState, formData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = safeCustomerNextPath(String(formData.get('next') ?? ''))

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE, { email })

  const emailError = validateEmail(email)
  if (emailError) return fail(emailError, { email })
  if (!password) return fail('Enter your password.', { email })

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return fail(customerSignInErrorMessage(error), { email, unconfirmed: error.code === 'email_not_confirmed' })
  }

  redirect(next)
}

export async function customerSignUp(_prevState, formData) {
  const fullName = String(formData.get('fullName') ?? '').trim().replace(/\s+/g, ' ')
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')
  const fields = { fullName, email }

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE, fields)

  const invalid = validateFullName(fullName) || validateEmail(email) || validatePassword(password, confirmation)
  if (invalid) return fail(invalid, fields)

  const supabase = await createClient()
  const origin = await siteOrigin()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the on_auth_user_created trigger to fill profiles.full_name.
      data: { full_name: fullName },
      emailRedirectTo: `${origin}${AUTH_CONFIRM}?next=${encodeURIComponent(CUSTOMER_HOME)}`,
    },
  })

  // With confirmation off, an existing address is a real error…
  if (error?.code === 'user_already_exists' || error?.code === 'email_exists') {
    return fail(null, { ...fields, exists: true })
  }
  if (error) return fail(signUpErrorMessage(error), fields)

  // …with confirmation on (this project), Supabase answers an existing
  // address with a stand-in user that has no identities, and sends nothing.
  // That is the documented signal for "already registered".
  if (data.user && data.user.identities?.length === 0) {
    return fail(null, { ...fields, exists: true })
  }

  // Confirmation disabled: Supabase signed the user in already.
  if (data.session) redirect(`${CUSTOMER_HOME}?welcome=1`)

  return { ok: true, needsConfirmation: true, email }
}

/** Resends the sign-up confirmation email. Same response either way. */
export async function resendConfirmation(_prevState, formData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!isSupabaseConfigured() || validateEmail(email)) return { ok: true, email }

  const supabase = await createClient()
  const origin = await siteOrigin()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}${AUTH_CONFIRM}?next=${encodeURIComponent(CUSTOMER_HOME)}` },
  })

  if (error?.code === 'over_email_send_rate_limit' || error?.code === 'over_request_rate_limit') {
    return fail('Too many requests. Wait a minute before asking for another email.', { email })
  }
  return { ok: true, email, resent: true }
}

/**
 * Whether Google is switched on in Supabase → Authentication → Providers.
 *
 * Checked before redirecting, because Supabase answers a disabled provider
 * with a bare JSON error page rather than a redirect back to the app — the
 * visitor would be stranded on supabase.co. Cached for five minutes.
 */
let providerCache = { at: 0, google: false }

async function isGoogleEnabled() {
  if (Date.now() - providerCache.at < 5 * 60 * 1000) return providerCache.google
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
    })
    const settings = await response.json()
    providerCache = { at: Date.now(), google: Boolean(settings?.external?.google) }
  } catch {
    // Network failure: let the attempt go ahead rather than blocking sign-in.
    return true
  }
  return providerCache.google
}

export async function signInWithGoogle(_prevState, formData) {
  const next = safeCustomerNextPath(String(formData.get('next') ?? ''))

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE)
  if (!(await isGoogleEnabled())) {
    return fail('Google sign-in is not available right now. Use your email and password instead.')
  }

  const supabase = await createClient()
  const origin = await siteOrigin()

  // PKCE: the code verifier is written to an httpOnly cookie here, and the
  // callback route exchanges Google's code for a session with it.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${AUTH_CALLBACK}?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error || !data?.url) return fail('Could not reach Google. Please try again.')
  redirect(data.url)
}

/** Returns instead of redirecting, so the header can update in place. */
export async function customerSignOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  return { ok: true }
}

export async function customerRequestPasswordReset(_prevState, formData) {
  const email = String(formData.get('email') ?? '').trim()

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE, { email })

  const emailError = validateEmail(email)
  if (emailError) return fail(emailError, { email })

  const supabase = await createClient()
  const origin = await siteOrigin()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}${AUTH_CONFIRM}?next=${encodeURIComponent(CUSTOMER_RESET_PASSWORD)}`,
  })

  // Identical confirmation whether or not the address exists — otherwise this
  // form would tell anyone which emails have accounts.
  if (error?.code === 'over_email_send_rate_limit' || error?.code === 'over_request_rate_limit') {
    return fail('Too many requests. Wait a minute before trying again.', { email })
  }
  return { ok: true, email }
}

export async function customerUpdatePassword(_prevState, formData) {
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')

  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED_MESSAGE)

  const passwordError = validatePassword(password, confirmation)
  if (passwordError) return fail(passwordError)

  const supabase = await createClient()

  // The recovery link is what signs the user in; no session means the link was
  // never opened in this browser, has expired, or was already spent.
  const { data } = await supabase.auth.getUser()
  if (!data?.user) return fail('This reset link has expired or has already been used. Request a new one.')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return fail(resetErrorMessage(error))

  // A reset usually follows a suspected compromise: end every other session.
  await supabase.auth.signOut({ scope: 'others' })
  redirect(`${CUSTOMER_HOME}?reset=1`)
}
