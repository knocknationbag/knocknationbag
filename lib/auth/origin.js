import 'server-only'

import { headers } from 'next/headers'

/**
 * Absolute origin for links Supabase emails out and for OAuth return URLs.
 *
 * Derived from the request so local development and preview deploys work with
 * no configuration; NEXT_PUBLIC_SITE_URL overrides it where the app sits behind
 * a proxy that rewrites Host.
 */
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}
