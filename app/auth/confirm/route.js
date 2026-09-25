import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { ADMIN_FORGOT_PASSWORD, ADMIN_RESET_PASSWORD, isAdminPath, safeNextPath } from '@/lib/auth/routes'
import {
  CUSTOMER_FORGOT_PASSWORD,
  CUSTOMER_LOGIN,
  CUSTOMER_RESET_PASSWORD,
  safeCustomerNextPath,
} from '@/lib/auth/customerRoutes'

/**
 * Landing point for every emailed Supabase auth link — admin and customer.
 *
 * Two link formats are accepted, because which one arrives depends on the
 * email template configured in Supabase:
 *   - `?token_hash=…&type=…` — a custom template pointing straight here;
 *     exchanged with verifyOtp().
 *   - `?code=…` — the default template, which verifies on supabase.co and
 *     redirects here with a PKCE code; exchanged with exchangeCodeForSession().
 * Either way the exchange happens server-side, so the session becomes an
 * httpOnly cookie rather than a token in a client-side URL.
 *
 * The `next` path decides the audience: an /admin path is sanitised by the
 * admin rules and falls back to the admin screens; anything else is a customer
 * link and stays on the storefront. With no `next` at all, the historical
 * admin reset flow is assumed.
 *
 * Add this URL to Supabase → Authentication → URL Configuration → Redirect URLs.
 */

/** Only the link types this app actually sends. Anything else is rejected. */
const ALLOWED_TYPES = ['recovery', 'email', 'invite', 'magiclink', 'email_change', 'signup']

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const rawNext = searchParams.get('next') ?? ADMIN_RESET_PASSWORD

  const isAdminLink = isAdminPath(rawNext)
  const next = isAdminLink ? safeNextPath(rawNext) : safeCustomerNextPath(rawNext)

  // Where a dead link lands: a reset link goes back to "request a new one",
  // a sign-up confirmation goes to sign in (the address is often confirmed
  // already — only the automatic sign-in failed).
  const failed = isAdminLink
    ? `${ADMIN_FORGOT_PASSWORD}?error=expired`
    : next === CUSTOMER_RESET_PASSWORD
      ? `${CUSTOMER_FORGOT_PASSWORD}?error=expired`
      : `${CUSTOMER_LOGIN}?error=link_expired`
  const redirectTo = (path) => NextResponse.redirect(new URL(path, request.url))

  if (!isSupabaseConfigured()) return redirectTo(failed)

  const supabase = await createClient()

  if (tokenHash && ALLOWED_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    return redirectTo(error ? failed : next)
  }

  if (code) {
    // Needs the PKCE verifier cookie from the browser that asked for the
    // email; a link opened on another device fails here and says so.
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    return redirectTo(error ? failed : next)
  }

  return redirectTo(failed)
}
