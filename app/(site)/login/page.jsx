import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import AuthDivider from '@/components/auth/AuthDivider'
import GoogleButton from '@/components/auth/GoogleButton'
import LoginForm from '@/components/auth/LoginForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { NOT_CONFIGURED_MESSAGE } from '@/lib/auth/authErrors'
import { CUSTOMER_HOME, safeCustomerNextPath } from '@/lib/auth/customerRoutes'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Knock Nation Bag account to track orders and check out faster.',
  robots: { index: false, follow: true },
}

// Reads ?next= / ?error= and is gated on the session by the proxy.
export const dynamic = 'force-dynamic'

/** `?error=` values set by /auth/callback and /auth/confirm. */
const NOTICES = {
  oauth_cancelled: { tone: 'info', text: 'Google sign-in was cancelled. Choose another way to sign in.' },
  oauth_failed: { tone: 'error', text: 'We could not sign you in with Google. Please try again.' },
  link_expired: {
    tone: 'info',
    text: 'That confirmation link has expired or was opened in a different browser. If you have already confirmed your email, sign in below.',
  },
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const next = safeCustomerNextPath(params?.next)
  const nextField = next === CUSTOMER_HOME ? '' : next
  const email = typeof params?.email === 'string' ? params.email.slice(0, 254) : ''

  const notice = isSupabaseConfigured()
    ? NOTICES[params?.error] ?? null
    : { tone: 'error', text: NOT_CONFIGURED_MESSAGE }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to track your orders and check out faster with saved details."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
            Create an account
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <GoogleButton next={nextField} />
        <AuthDivider label="or sign in with email" />
        <LoginForm next={nextField} defaultEmail={email} notice={notice} />
      </div>
    </AuthShell>
  )
}
