import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { ADMIN_FORGOT_PASSWORD, ADMIN_RESET_PASSWORD, safeNextPath } from '@/lib/auth/routes'

/**
 * Landing point for every emailed Supabase auth link.
 *
 * Supabase sends a one-time `token_hash`; this handler exchanges it for a real
 * session cookie and then forwards the user on. The exchange has to happen
 * server-side — a token in a client-side URL fragment cannot become an httpOnly
 * cookie, which is exactly what the older implicit flow got wrong.
 *
 * Add this URL to Supabase → Authentication → URL Configuration → Redirect URLs,
 * or the links in the emails will be rejected:
 *   http://localhost:3000/auth/confirm
 *   https://your-domain.com/auth/confirm
 */

/** Only the link types this app actually sends. Anything else is rejected. */
const ALLOWED_TYPES = ['recovery', 'email', 'invite', 'magiclink', 'email_change', 'signup']

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = safeNextPath(searchParams.get('next') ?? ADMIN_RESET_PASSWORD)

  const expired = new URL(`${ADMIN_FORGOT_PASSWORD}?error=expired`, request.url)

  if (!isSupabaseConfigured() || !tokenHash || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.redirect(expired)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) return NextResponse.redirect(expired)

  // verifyOtp wrote the session cookies through the server client, so the
  // redirect target is already authenticated.
  return NextResponse.redirect(new URL(next, request.url))
}
