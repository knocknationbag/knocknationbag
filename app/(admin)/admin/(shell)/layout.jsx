import { redirect } from 'next/navigation'

import AdminShell from '@/components/admin/layout/AdminShell'
import { getDashboardUser } from '@/lib/auth/session'
import { hasDashboardAccess } from '@/lib/auth/permissions'
import { ADMIN_LOGIN, ADMIN_UNAUTHORIZED } from '@/lib/auth/routes'

/**
 * The authenticated dashboard frame.
 *
 * This check is not a duplicate of the one in proxy.js — it is the real one.
 * Proxy runs before rendering and gives a fast redirect, but per the Next.js
 * docs it is an optimistic gate only; a request that reaches a Server Component
 * by any other path would sail straight through it. Verifying here means the
 * dashboard cannot render without a session that `getUser()` has validated
 * against Supabase.
 *
 * Reading the session makes every page below dynamic, which is correct: nothing
 * gated on who you are may be statically cached (docs/CLAUDE.md §19).
 */
export default async function AdminShellLayout({ children }) {
  const user = await getDashboardUser()

  if (!user) redirect(ADMIN_LOGIN)
  if (!hasDashboardAccess(user)) redirect(ADMIN_UNAUTHORIZED)

  return <AdminShell user={user}>{children}</AdminShell>
}
