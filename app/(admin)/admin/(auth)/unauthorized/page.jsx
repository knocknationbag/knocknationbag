import { ShieldOff } from 'lucide-react'

import AuthShell from '@/components/admin/auth/AuthShell'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import AdminButton from '@/components/admin/ui/AdminButton'
import { getSessionUser } from '@/lib/auth/session'
import { signOut } from '@/lib/auth/actions'

export const metadata = { title: 'No access' }

export const dynamic = 'force-dynamic'

/**
 * Where an authenticated user lands when their role carries no dashboard
 * permission — a storefront Customer, or a staff account created before anyone
 * assigned it a role.
 *
 * Signing out has to be a form posting to a Server Action: clearing an httpOnly
 * cookie is something only the server can do, which is the point of storing the
 * session there.
 */
export default async function AdminUnauthorizedPage() {
  const user = await getSessionUser()

  return (
    <AuthShell
      title="You don't have access"
      description="Your account is signed in, but it isn't allowed into the dashboard."
    >
      <div className="flex flex-col gap-4">
        <AuthMessage tone="info">
          <span className="flex flex-wrap items-center gap-x-1.5">
            <ShieldOff size={13} aria-hidden="true" />
            {user ? (
              <>
                Signed in as <strong className="font-semibold">{user.email}</strong> ·{' '}
                {user.roleLabel}
              </>
            ) : (
              'No active session.'
            )}
          </span>
        </AuthMessage>

        <p className="text-admin-sm leading-[18px] text-body">
          Dashboard access is granted per role. If you should have it, ask a Super Admin to assign
          your role — until then nothing here is available to you.
        </p>

        <div className="flex flex-wrap gap-2">
          <form action={signOut}>
            <AdminButton type="submit" variant="primary" size="md">
              Sign out
            </AdminButton>
          </form>
          <AdminButton href="/" size="md">
            Return to store
          </AdminButton>
        </div>
      </div>
    </AuthShell>
  )
}
