import { redirect } from 'next/navigation'

import { ADMIN_HOME } from '@/lib/auth/routes'

/**
 * /admin is a bare entry point — the dashboard itself lives at /admin/dashboard,
 * which is where sign-in lands. Redirecting keeps every existing bookmark and
 * breadcrumb working rather than orphaning them.
 */
export default function AdminIndexPage() {
  redirect(ADMIN_HOME)
}
