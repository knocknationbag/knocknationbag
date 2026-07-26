import AuthShell from '@/components/admin/auth/AuthShell'
import ForgotPasswordForm from '@/components/admin/auth/ForgotPasswordForm'

export const metadata = { title: 'Reset your password' }

export const dynamic = 'force-dynamic'

export default async function AdminForgotPasswordPage({ searchParams }) {
  const params = await searchParams

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email address on your staff account and we'll send you a link to set a new password."
    >
      <ForgotPasswordForm linkExpired={params?.error === 'expired'} />
    </AuthShell>
  )
}
