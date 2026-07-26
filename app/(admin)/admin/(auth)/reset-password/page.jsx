import AuthShell from '@/components/admin/auth/AuthShell'
import ResetPasswordForm from '@/components/admin/auth/ResetPasswordForm'
import { getSessionUser } from '@/lib/auth/session'

export const metadata = { title: 'Choose a new password' }

export const dynamic = 'force-dynamic'

/**
 * Following the recovery link signs the user in, so a session here *is* the
 * proof that the link was valid. No session means the page was opened directly
 * or the link has already been spent, and the form says so instead of failing
 * on submit.
 */
export default async function AdminResetPasswordPage() {
  const user = await getSessionUser()

  return (
    <AuthShell
      title="Choose a new password"
      description={
        user
          ? `Setting a new password for ${user.email}.`
          : 'This page is reached from the link in a password reset email.'
      }
    >
      <ResetPasswordForm hasRecoverySession={Boolean(user)} />
    </AuthShell>
  )
}
