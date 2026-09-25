import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { NOT_CONFIGURED_MESSAGE } from '@/lib/auth/authErrors'

export const metadata = {
  title: 'Reset Password',
  description: 'Request a password reset link for your Knock Nation Bag account.',
  robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams

  const notice = !isSupabaseConfigured()
    ? { tone: 'error', text: NOT_CONFIGURED_MESSAGE }
    : params?.error === 'expired'
      ? { tone: 'error', text: 'That reset link has expired or has already been used. Request a new one below.' }
      : null

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email address on your account and we will send a reset link. The link expires after one hour."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm notice={notice} />
    </AuthShell>
  )
}
