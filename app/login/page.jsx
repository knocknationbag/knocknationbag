import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Knock Nation Bag account to track orders and manage your wishlist.',
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to track orders, manage addresses and sync your wishlist across devices."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
            Create an account
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5">
        <Field id="login-email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@example.com" />
        <Field id="login-password" name="password" type="password" label="Password" autoComplete="current-password" placeholder="••••••••" />

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-[14px] text-body">
            <input type="checkbox" className="size-4 rounded-[4px] accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold" />
            Keep me signed in
          </label>
          <Link href="/forgot-password" className="text-[14px] font-semibold text-gold underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth>Sign in</Button>
      </form>
    </AuthShell>
  )
}
