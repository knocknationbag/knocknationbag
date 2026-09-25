/**
 * Form validation and Supabase error translation for the auth screens.
 *
 * Pure functions, kept out of actions.js because a `'use server'` module may
 * only export async functions.
 */

/** Minimum we enforce. Supabase's own default is 6; raise it there too. */
export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(email) {
  if (!email) return 'Enter your email address.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return null
}

export function validatePassword(password, confirmation) {
  if (!password) return 'Enter a new password.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (confirmation !== undefined && password !== confirmation) {
    return 'Both passwords must match.'
  }
  return null
}

/**
 * Turns a Supabase auth error into something safe to show.
 *
 * Bad credentials always read the same whether the address exists or not —
 * "no account with that email" is an account-enumeration oracle, and it is the
 * one message worth being deliberately unhelpful about.
 */
export function signInErrorMessage(error) {
  switch (error?.code) {
    case 'email_not_confirmed':
      return 'Confirm your email address first — check your inbox for the verification link.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Wait a minute and try again.'
    case 'user_banned':
      return 'This account has been suspended. Contact a Super Admin.'
    default:
      return 'Invalid email or password.'
  }
}

export function resetErrorMessage(error) {
  switch (error?.code) {
    case 'weak_password':
      return `That password is too weak. Use at least ${MIN_PASSWORD_LENGTH} characters with a mix of letters and numbers.`
    case 'same_password':
      return 'Choose a password you have not used before.'
    case 'over_request_rate_limit':
      return 'Too many attempts. Wait a minute and try again.'
    default:
      return 'That reset link has expired or has already been used. Request a new one.'
  }
}

// ---------------------------------------------------------------------------
// Storefront (customer) auth
// ---------------------------------------------------------------------------

export const MAX_NAME_LENGTH = 100

export function validateFullName(name) {
  if (!name) return 'Enter your full name.'
  if (name.length > MAX_NAME_LENGTH) return `Keep your name under ${MAX_NAME_LENGTH} characters.`
  return null
}

/** Same rules as signInErrorMessage; only the suspended-account advice differs. */
export function customerSignInErrorMessage(error) {
  if (error?.code === 'user_banned') {
    return 'This account has been suspended. Contact us if you think this is a mistake.'
  }
  return signInErrorMessage(error)
}

/**
 * Sign-up failures. "Already registered" is handled by the caller, because
 * Supabase reports it as a *successful* response with no identities rather
 * than as an error while email confirmation is on.
 */
export function signUpErrorMessage(error) {
  switch (error?.code) {
    case 'weak_password':
      return `That password is too weak. Use at least ${MIN_PASSWORD_LENGTH} characters with a mix of letters and numbers.`
    case 'email_address_invalid':
      return 'That email address cannot receive mail. Use a different one.'
    case 'email_address_not_authorized':
      return 'We could not send a confirmation email to that address. Try a different one, or contact us.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many sign-up attempts. Wait a minute and try again.'
    case 'signup_disabled':
      return 'New accounts are not being accepted right now. Please try again later.'
    default:
      return 'We could not create your account. Please try again.'
  }
}

/** Shown on every auth screen when the environment variables are missing. */
export const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured yet. Add your project credentials to .env.local and restart the dev server — see docs/supabase.md.'
