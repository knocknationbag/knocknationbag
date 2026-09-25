import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import { AccountProvider } from '@/components/auth/AccountProvider'
import { CartProvider } from '@/components/cart/CartProvider'
import { getShopMenu } from '@/lib/catalog/navigation'

/**
 * Storefront chrome. Applies to every public page.
 * The admin dashboard lives in app/(admin) and deliberately does not inherit this.
 * Route groups do not affect URLs, so every public path is unchanged.
 *
 * AccountProvider tells the header who is signed in. It fetches after load, so
 * this layout stays static and so do the pages under it.
 *
 * The Shop menu is built from live categories through the cached, cookie-free
 * catalogue client, so reading it does not make pages dynamic either.
 */
export default async function SiteLayout({ children }) {
  const shopMenu = await getShopMenu()

  return (
    <AccountProvider>
      <CartProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]
                   focus:rounded-full focus:bg-ink focus:px-6 focus:py-3 focus:text-btn
                   focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Header menus={shopMenu ? { shop: shopMenu } : {}} />

      <main id="main">{children}</main>

      <Footer />
      <MobileNav />
      </CartProvider>
    </AccountProvider>
  )
}
