import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import AuthDivider from '@/components/auth/AuthDivider'
import AuthNotice from '@/components/auth/AuthNotice'
import GoogleButton from '@/components/auth/GoogleButton'
import RegisterForm from '@/components/auth/RegisterForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { NOT_CONFIGURED_MESSAGE } from '@/lib/auth/authErrors'

export const metadata = {
  title: 'Create Account',
  description: 'Create a Knock Nation Bag account for faster checkout and order tracking.',
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Faster checkout with saved details, and every order in one place. You can also check out as a guest."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {isSupabaseConfigured() ? null : <AuthNotice tone="error">{NOT_CONFIGURED_MESSAGE}</AuthNotice>}
        <GoogleButton />
        <AuthDivider label="or sign up with email" />
        <RegisterForm />
      </div>
    </AuthShell>
  )
}
