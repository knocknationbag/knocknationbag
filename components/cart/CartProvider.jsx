'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { getCartCount } from '@/lib/cart/actions'

/**
 * The cart badge count for the header and bottom nav.
 *
 * Loaded after the page renders (the cart lives behind an httpOnly cookie, so
 * static pages cannot know it), then kept current by whoever changes the cart
 * calling setCount with the count the server returns. Re-read when visiting
 * pages that can change the cart elsewhere (checkout empties it; sign-in can
 * bring back an account's cart).
 */
const CartContext = createContext({ count: 0, setCount: () => {}, refresh: () => {} })

const REFRESH_ON = ['/cart', '/checkout', '/order', '/account', '/login']

export function CartProvider({ children }) {
  const [count, setCount] = useState(0)
  const pathname = usePathname()
  const previous = useRef(null)

  const refresh = useCallback(() => {
    getCartCount().then(setCount).catch(() => {})
  }, [])

  useEffect(() => {
    const from = previous.current
    previous.current = pathname
    const touches = (path) => REFRESH_ON.some((p) => path === p || path?.startsWith(`${p}/`))
    if (from === null || touches(from) || touches(pathname)) refresh()
  }, [pathname, refresh])

  return <CartContext.Provider value={{ count, setCount, refresh }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
