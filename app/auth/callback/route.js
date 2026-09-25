import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { CUSTOMER_LOGIN, safeCustomerNextPath } from '@/lib/auth/customerRoutes'

/**
 * Where Google (via Supabase) sends the visitor back after OAuth.
 *
 * Success arrives as `?code=`, exchanged here for a session using the PKCE
 * verifier cookie that signInWithGoogle() set. Failure or cancellation
 * arrives as `?error=` — the visitor goes back to /login with a readable
 * reason instead of a raw error page.
 *
 * Account linking is Supabase's job, not this route's: a Google identity whose
 * verified email matches an existing account is attached to that account, so
 * the same user id — and the same profile row — comes back. A brand-new Google
 * user gets a profile from the on_auth_user_created trigger.
 *
 * Add this URL to Supabase → Authentication → URL Configuration → Redirect
 * URLs (e.g. http://localhost:3000/auth/callback and the production domain).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeCustomerNextPath(searchParams.get('next'))

  const backToLogin = (reason) =>
    NextResponse.redirect(new URL(`${CUSTOMER_LOGIN}?error=${reason}`, request.url))

  // access_denied is what Google reports when the visitor closes the consent
  // screen or presses Cancel.
  const providerError = searchParams.get('error')
  if (providerError) return backToLogin(providerError === 'access_denied' ? 'oauth_cancelled' : 'oauth_failed')

  if (!isSupabaseConfigured() || !code) return backToLogin('oauth_failed')

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return backToLogin('oauth_failed')

  return NextResponse.redirect(new URL(next, request.url))
}
