import { redirect } from 'next/navigation'

import { getDashboardUser } from '@/lib/auth/session'
import { hasDashboardAccess } from '@/lib/auth/permissions'
import { ADMIN_LOGIN, ADMIN_UNAUTHORIZED } from '@/lib/auth/routes'

/**
 * Printable order documents for the team: the bill and the 3 × 5 shipping
 * label. Outside the (shell) group so the sidebar and topbar never reach the
 * printer, but gated exactly like it — the session is verified here with
 * getUser(), and each page checks its own permission.
 */
export default async function AdminPrintLayout({ children }) {
  const user = await getDashboardUser()
  if (!user) redirect(ADMIN_LOGIN)
  if (!hasDashboardAccess(user)) redirect(ADMIN_UNAUTHORIZED)

  return <main className="min-h-svh bg-surface-muted pb-10 print:bg-surface print:pb-0">{children}</main>
}
