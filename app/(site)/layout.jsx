import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'

/**
 * Storefront chrome. Applies to every public page.
 * The admin dashboard lives in app/(admin) and deliberately does not inherit this.
 * Route groups do not affect URLs, so every public path is unchanged.
 */
export default function SiteLayout({ children }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]
                   focus:rounded-full focus:bg-ink focus:px-6 focus:py-3 focus:text-btn
                   focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Header />

      <main id="main">{children}</main>

      <Footer />
      <MobileNav />
    </>
  )
}
