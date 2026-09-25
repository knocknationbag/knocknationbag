/**
 * Canonical navigation. These lists render at EVERY breakpoint —
 * on mobile the header nav moves into the drawer, it is never trimmed.
 * See docs/responsive.md §4.1.
 */

export const headerNav = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop', mega: 'shop' },
  { label: 'Categories', href: '/categories' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Sale', href: '/collections/sale' },
  { label: 'About', href: '/about' },
]

/**
 * The Shop mega menu is built from live categories in the storefront layout
 * (lib/catalog/navigation.js) — categories are managed in the dashboard, so a
 * hard-coded list here would go stale the first time the owner edits one.
 */

export const headerActions = [
  { label: 'Account', href: '/account', icon: 'user' },
]

export const footerColumns = [
  {
    heading: 'Quick Links',
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'Sale', href: '/collections/sale' },
      { label: 'Collections', href: '/collections' },
      { label: 'Brand', href: '/brand' },
    ],
  },
  {
    heading: 'Customer Service',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
    ],
  },
  {
    heading: 'Policies',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Warranty Coverage', href: '/warranty' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
]

/** Mobile-only floating bottom navigation. docs/responsive.md §4.12. */
export const mobileNav = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Categories', href: '/categories', icon: 'grid' },
  { label: 'Search', href: '/search', icon: 'search' },
  { label: 'Cart', href: '/cart', icon: 'bag' },
  { label: 'Profile', href: '/account', icon: 'user' },
]
