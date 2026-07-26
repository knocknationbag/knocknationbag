import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Reset Password',
  description: 'Request a password reset link for your Knock Nation Bag account.',
  robots: { index: false, follow: true },
}

export default function ForgotPasswordPage() {
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
      <form className="flex flex-col gap-5">
        <Field id="fp-email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@example.com" />
        <Button type="submit" variant="primary" size="md" fullWidth>Send reset link</Button>
      </form>
    </AuthShell>
  )
}
