import { NextResponse } from 'next/server'

import { getAccount } from '@/lib/auth/account'

/**
 * The visitor's account state for the storefront header.
 *
 * The header lives in every storefront page, most of which are statically
 * rendered. Reading the session in the layout would make every one of them
 * dynamic; asking here after load keeps them static. The auth cookies are
 * httpOnly, so the browser cannot answer this question itself.
 *
 * Only display fields leave the server — never a token.
 */
export async function GET() {
  const account = await getAccount()
  const { status, name, firstName, email, initials, avatarUrl, roleLabel } = account

  return NextResponse.json(
    status === 'guest' ? { status } : { status, name, firstName, email, initials, avatarUrl, roleLabel },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
