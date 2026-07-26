import AuthShell from '@/components/admin/auth/AuthShell'
import LoginForm from '@/components/admin/auth/LoginForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { NOT_CONFIGURED_MESSAGE } from '@/lib/auth/authErrors'
import { safeNextPath, ADMIN_HOME } from '@/lib/auth/routes'

export const metadata = { title: 'Sign in' }

// Never cache a sign-in screen: it reads ?next= and its state depends on the
// caller's session.
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams
  const next = safeNextPath(params?.next)

  return (
    <AuthShell
      title="Sign in"
      description="Access the Knock Nation Bag dashboard with your staff account."
    >
      <LoginForm
        next={next === ADMIN_HOME ? '' : next}
        notice={isSupabaseConfigured() ? null : NOT_CONFIGURED_MESSAGE}
      />
    </AuthShell>
  )
}
