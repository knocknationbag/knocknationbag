/**
 * Admin navigation.
 *
 * Every module the dashboard has ever had is still defined below. What the
 * sidebar renders is controlled by `ENABLED_MODULES` — the build is deliberately
 * being narrowed to a few complete modules rather than many partial ones, and a
 * module comes back by adding its href to that array. Nothing is deleted.
 */

const ALL_NAV = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { label: 'Products', href: '/admin/products', icon: 'products' },
      { label: 'Categories', href: '/admin/categories', icon: 'categories', count: 8 },
      { label: 'Collections', href: '/admin/collections', icon: 'collections', count: 4 },
      { label: 'Brands', href: '/admin/brands', icon: 'brands', count: 4 },
      { label: 'Inventory', href: '/admin/inventory', icon: 'inventory' },
    ],
  },
  {
    group: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: 'orders', count: 3 },
      { label: 'Customers', href: '/admin/customers', icon: 'customers' },
      { label: 'Reviews', href: '/admin/reviews', icon: 'reviews' },
      { label: 'Coupons', href: '/admin/coupons', icon: 'coupons' },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'CMS Pages', href: '/admin/pages', icon: 'pages' },
      { label: 'Blog', href: '/admin/blog', icon: 'blog' },
      { label: 'Banners', href: '/admin/banners', icon: 'banners' },
      { label: 'Media Library', href: '/admin/media', icon: 'media' },
      { label: 'Forms', href: '/admin/forms', icon: 'forms' },
    ],
  },
  {
    group: 'SEO',
    items: [
      { label: 'SEO Overview', href: '/admin/seo', icon: 'seo' },
      { label: 'Redirects', href: '/admin/redirects', icon: 'redirects' },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: 'users' },
      { label: 'Roles', href: '/admin/roles', icon: 'roles' },
      { label: 'Logs', href: '/admin/logs', icon: 'logs' },
      { label: 'Settings', href: '/admin/settings', icon: 'settings' },
    ],
  },
]

/**
 * The modules currently exposed in the sidebar. Add an href to bring a module
 * back — its route, components and data are all still in the codebase.
 */
export const ENABLED_MODULES = ['/admin/dashboard', '/admin/users', '/admin/products']

/** What the sidebar renders — enabled modules only, empty groups dropped. */
export const adminNav = ALL_NAV
  .map((group) => ({ ...group, items: group.items.filter((i) => ENABLED_MODULES.includes(i.href)) }))
  .filter((group) => group.items.length > 0)

/**
 * Every item, enabled or not.
 *
 * Breadcrumbs read from this rather than the filtered list: a hidden module is
 * still reachable by URL and should render with a correct trail instead of
 * losing its label.
 */
export const adminNavFlat = ALL_NAV.flatMap((g) => g.items)

export function findAdminNavItem(pathname) {
  return (
    [...adminNavFlat]
      .sort((a, b) => b.href.length - a.href.length)
      .find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`)) ?? null
  )
}
