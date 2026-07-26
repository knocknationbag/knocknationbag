export const metadata = {
  title: { default: 'Dashboard', template: '%s · Admin — Knock Nation Bag' },
  // Neither the dashboard nor the sign-in screens may ever be indexed.
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Everything under /admin — but deliberately no chrome.
 *
 * The dashboard frame moved down into the (shell) route group so that the auth
 * screens, which share the /admin prefix, can render without a sidebar and
 * topbar. Route groups do not affect URLs, so every existing admin path is
 * unchanged:
 *
 *   (shell)/  sidebar + topbar, requires a session   -> /admin/products, …
 *   (auth)/   standalone, reachable signed-out       -> /admin/login, …
 */
export default function AdminLayout({ children }) {
  return children
}
