import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { getSessionUser } from '@/lib/auth/session'

export const metadata = {
  title: 'Choose a New Password',
  description: 'Set a new password for your Knock Nation Bag account.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Reached from the password-reset email via /auth/confirm, which turns the
 * link into a session. No session here means the link was never opened in
 * this browser, expired, or was already used.
 */
export default async function ResetPasswordPage() {
  const user = await getSessionUser()

  return (
    <AuthShell
      title="Choose a new password"
      description={
        user
          ? `Setting a new password for ${user.email}.`
          : 'This page opens from the link in a password reset email.'
      }
      footer={
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm hasRecoverySession={Boolean(user)} />
    </AuthShell>
  )
}
