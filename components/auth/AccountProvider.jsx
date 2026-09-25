'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { customerSignOut } from '@/lib/auth/customerActions'

/**
 * Storefront account state: { status: 'loading' | 'guest' | 'customer' | 'admin', … }.
 *
 * Fetched from /auth/session after load rather than read in the layout, so
 * statically rendered pages stay static. Display only — every protected page
 * and action re-verifies the session on the server; this context grants
 * nothing.
 *
 * Refetched whenever the visitor moves through a path where the session can
 * have changed (sign-in, sign-up, reset, OAuth return, /account).
 */
const AccountContext = createContext({ status: 'loading', signOut: async () => {} })

const SESSION_CHANGING = ['/login', '/register', '/forgot-password', '/reset-password', '/account', '/auth']

const touchesSession = (path) =>
  Boolean(path) && SESSION_CHANGING.some((route) => path === route || path.startsWith(`${route}/`))

export function AccountProvider({ children }) {
  const [account, setAccount] = useState({ status: 'loading' })
  const pathname = usePathname()
  const previousPath = useRef(null)
  const router = useRouter()

  const load = useCallback(async () => {
    try {
      const response = await fetch('/auth/session', { cache: 'no-store', credentials: 'same-origin' })
      setAccount(response.ok ? await response.json() : { status: 'guest' })
    } catch {
      setAccount({ status: 'guest' })
    }
  }, [])

  useEffect(() => {
    const from = previousPath.current
    previousPath.current = pathname
    if (from === null || touchesSession(from) || touchesSession(pathname)) load()
  }, [pathname, load])

  const signOut = useCallback(async () => {
    await customerSignOut()
    setAccount({ status: 'guest' })
    // Leave personal pages; elsewhere just re-render server data for a guest.
    if (touchesSession(pathname)) router.push('/')
    else router.refresh()
  }, [pathname, router])

  return <AccountContext.Provider value={{ ...account, signOut }}>{children}</AccountContext.Provider>
}

export function useAccount() {
  return useContext(AccountContext)
}
