/**
 * Role definitions for the admin UI.
 *
 * This is presentation metadata only — it drives which nav items and actions are
 * rendered. It is NOT a security boundary. When Supabase Auth lands, every
 * mutation must re-check the caller's role server-side (docs/CLAUDE.md §19).
 */

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',
  CATALOG_VIEW: 'catalog.view',
  CATALOG_EDIT: 'catalog.edit',
  INVENTORY_EDIT: 'inventory.edit',
  ORDERS_VIEW: 'orders.view',
  ORDERS_EDIT: 'orders.edit',
  CUSTOMERS_VIEW: 'customers.view',
  CONTENT_VIEW: 'content.view',
  CONTENT_EDIT: 'content.edit',
  MEDIA_EDIT: 'media.edit',
  SEO_VIEW: 'seo.view',
  SEO_EDIT: 'seo.edit',
  USERS_EDIT: 'users.edit',
  ROLES_EDIT: 'roles.edit',
  LOGS_VIEW: 'logs.view',
  SETTINGS_EDIT: 'settings.edit',
}

const P = PERMISSIONS
const ALL = Object.values(P)

export const roles = [
  {
    id: 'super-admin',
    label: 'Super Admin',
    description: 'Unrestricted access, including roles, billing and destructive actions.',
    tone: 'ink',
    permissions: ALL,
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Everything except role management and system logs.',
    tone: 'gold',
    permissions: ALL.filter((p) => p !== P.ROLES_EDIT && p !== P.LOGS_VIEW),
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Catalogue, orders and customers. No system settings.',
    tone: 'gold',
    permissions: [
      P.DASHBOARD_VIEW, P.ANALYTICS_VIEW, P.CATALOG_VIEW, P.CATALOG_EDIT,
      P.INVENTORY_EDIT, P.ORDERS_VIEW, P.ORDERS_EDIT, P.CUSTOMERS_VIEW,
      P.CONTENT_VIEW, P.SEO_VIEW,
    ],
  },
  {
    id: 'seo-manager',
    label: 'SEO Manager',
    description: 'All SEO fields, redirects and metadata across every content type.',
    tone: 'verified',
    permissions: [
      P.DASHBOARD_VIEW, P.ANALYTICS_VIEW, P.CATALOG_VIEW, P.CONTENT_VIEW,
      P.SEO_VIEW, P.SEO_EDIT, P.MEDIA_EDIT,
    ],
  },
  {
    id: 'content-editor',
    label: 'Content Editor',
    description: 'CMS pages, blog, banners and media. Read-only catalogue.',
    tone: 'verified',
    permissions: [
      P.DASHBOARD_VIEW, P.CATALOG_VIEW, P.CONTENT_VIEW, P.CONTENT_EDIT,
      P.MEDIA_EDIT, P.SEO_VIEW, P.SEO_EDIT,
    ],
  },
  {
    id: 'inventory-manager',
    label: 'Inventory Manager',
    description: 'Stock levels and product availability only.',
    tone: 'neutral',
    permissions: [P.DASHBOARD_VIEW, P.CATALOG_VIEW, P.INVENTORY_EDIT],
  },
  {
    id: 'order-manager',
    label: 'Order Manager',
    description: 'Fulfilment, refunds and shipping.',
    tone: 'neutral',
    permissions: [P.DASHBOARD_VIEW, P.ORDERS_VIEW, P.ORDERS_EDIT, P.CUSTOMERS_VIEW],
  },
  {
    id: 'support',
    label: 'Customer Support',
    description: 'Read-only across orders and customers for handling enquiries.',
    tone: 'neutral',
    permissions: [P.DASHBOARD_VIEW, P.ORDERS_VIEW, P.CUSTOMERS_VIEW, P.CATALOG_VIEW],
  },
  {
    id: 'customer',
    label: 'Customer',
    description: 'Storefront account only. No dashboard access.',
    tone: 'muted',
    permissions: [],
  },
]

export function getRole(id) {
  return roles.find((r) => r.id === id) ?? null
}

export function roleCan(roleId, permission) {
  return Boolean(getRole(roleId)?.permissions.includes(permission))
}

/** Which permission each nav module requires. Used to filter the sidebar. */
export const MODULE_PERMISSION = {
  '/admin/dashboard': P.DASHBOARD_VIEW,
  '/admin/analytics': P.ANALYTICS_VIEW,
  '/admin/products': P.CATALOG_VIEW,
  '/admin/categories': P.CATALOG_VIEW,
  '/admin/collections': P.CATALOG_VIEW,
  '/admin/brands': P.CATALOG_VIEW,
  '/admin/inventory': P.INVENTORY_EDIT,
  '/admin/orders': P.ORDERS_VIEW,
  '/admin/customers': P.CUSTOMERS_VIEW,
  '/admin/reviews': P.CONTENT_VIEW,
  '/admin/coupons': P.ORDERS_EDIT,
  '/admin/pages': P.CONTENT_VIEW,
  '/admin/blog': P.CONTENT_VIEW,
  '/admin/banners': P.CONTENT_VIEW,
  '/admin/media': P.MEDIA_EDIT,
  '/admin/forms': P.CONTENT_VIEW,
  '/admin/seo': P.SEO_VIEW,
  '/admin/redirects': P.SEO_EDIT,
  '/admin/users': P.USERS_EDIT,
  '/admin/roles': P.ROLES_EDIT,
  '/admin/logs': P.LOGS_VIEW,
  '/admin/settings': P.SETTINGS_EDIT,
}
