/**
 * Hardening applied to every Supabase auth cookie this app writes.
 *
 * @supabase/ssr deliberately leaves these cookies readable by JavaScript so
 * that `createBrowserClient` can pick up the session in the browser. This app
 * never needs that: every authenticated operation runs in a Server Action,
 * Route Handler or Server Component, and the proxy refreshes tokens server-side.
 * So the cookies are marked httpOnly, which puts the access and refresh tokens
 * out of reach of any script — the single highest-value thing an XSS could
 * steal becomes unreadable.
 *
 * The trade-off is real and intentional: lib/supabase/client.js cannot see the
 * session while this is in place. A Client Component that needs user-scoped
 * data must call a Server Action rather than querying Supabase directly. If
 * client-side realtime or RLS queries are ever needed, this is the one decision
 * to revisit — and doing so means accepting a token that scripts can read.
 */
export function hardenCookieOptions(options = {}) {
  return {
    ...options,
    httpOnly: true,
    sameSite: options.sameSite ?? 'lax',
    // Browsers accept Secure cookies on http://localhost, so this stays correct
    // in local development while forcing HTTPS-only in production.
    secure: process.env.NODE_ENV === 'production',
    path: options.path ?? '/',
  }
}
