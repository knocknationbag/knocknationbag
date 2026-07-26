/**
 * Canonical navigation. These lists render at EVERY breakpoint —
 * on mobile the header nav moves into the drawer, it is never trimmed.
 * See docs/responsive.md §4.1.
 */

export const headerNav = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop', mega: 'shop' },
  { label: 'Men', href: '/category/men' },
  { label: 'Women', href: '/category/women' },
  { label: 'Travel', href: '/category/travel' },
  { label: 'Backpacks', href: '/category/backpack' },
  { label: 'Collections', href: '/collections', mega: 'collections' },
  { label: 'About', href: '/about' },
]

/** Panels rendered by MegaMenu when a nav item declares `mega`. */
export const megaMenus = {
  shop: {
    columns: [
      {
        heading: 'Shop by category',
        links: [
          { label: 'Men', href: '/category/men' },
          { label: 'Women', href: '/category/women' },
          { label: 'Travel', href: '/category/travel' },
          { label: 'Backpacks', href: '/category/backpack' },
        ],
      },
      {
        heading: 'Work & study',
        links: [
          { label: 'Laptop Bags', href: '/category/laptop' },
          { label: 'Office Bags', href: '/category/office' },
          { label: 'School Bags', href: '/category/school' },
          { label: 'Accessories', href: '/category/accessories' },
        ],
      },
      {
        heading: 'Browse',
        links: [
          { label: 'All products', href: '/shop' },
          { label: 'All categories', href: '/categories' },
          { label: 'Sale', href: '/collections/sale' },
          { label: 'Search', href: '/search' },
        ],
      },
    ],
    feature: {
      href: '/collections/new-arrivals',
      image: '/images/products/aero-shell-suitcase.webp',
      imageAlt: 'Aero Shell Suitcase bronze hardshell case on a marble plinth',
      eyebrow: 'THE CUTTING EDGE',
      title: 'New Arrivals',
    },
  },
  collections: {
    columns: [
      {
        heading: 'Curated edits',
        links: [
          { label: 'New Arrivals', href: '/collections/new-arrivals' },
          { label: 'Best Sellers', href: '/collections/best-sellers' },
          { label: 'Featured Collection', href: '/collections/featured' },
          { label: 'Sale', href: '/collections/sale' },
        ],
      },
      {
        heading: 'Product lines',
        links: [
          { label: 'KNB Atelier', href: '/shop?brand=KNB+Atelier' },
          { label: 'KNB Voyage', href: '/shop?brand=KNB+Voyage' },
          { label: 'KNB Field', href: '/shop?brand=KNB+Field' },
          { label: 'KNB Executive', href: '/shop?brand=KNB+Executive' },
        ],
      },
      {
        heading: 'The brand',
        links: [
          { label: 'About us', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Warranty', href: '/warranty' },
          { label: 'FAQ', href: '/faq' },
        ],
      },
    ],
    feature: {
      href: '/collections/best-sellers',
      image: '/images/products/executive-messenger.webp',
      imageAlt: 'Executive Messenger black leather satchel with brass buckles',
      eyebrow: 'ELITE FAVORITES',
      title: 'Best Sellers',
    },
  },
}

export const headerActions = [
  { label: 'Wishlist', href: '/wishlist', icon: 'heart' },
  { label: 'Account', href: '/account', icon: 'user' },
]

export const footerColumns = [
  {
    heading: 'Quick Links',
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'Best Sellers', href: '/collections/best-sellers' },
      { label: 'Collections', href: '/collections' },
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
  { label: 'Wishlist', href: '/wishlist', icon: 'heart' },
  { label: 'Cart', href: '/cart', icon: 'bag' },
  { label: 'Profile', href: '/account', icon: 'user' },
]
