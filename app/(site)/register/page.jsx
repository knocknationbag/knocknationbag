import Link from 'next/link'

import AuthShell from '@/components/common/AuthShell'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Create Account',
  description: 'Create a Knock Nation Bag account for faster checkout, order tracking and a synced wishlist.',
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Faster checkout, order tracking, and a wishlist that follows you between devices."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="reg-first" name="firstName" label="First name" autoComplete="given-name" />
          <Field id="reg-last" name="lastName" label="Last name" autoComplete="family-name" />
        </div>
        <Field id="reg-email" name="email" type="email" label="Email address" autoComplete="email" placeholder="you@example.com" />
        <Field id="reg-password" name="password" type="password" label="Password" autoComplete="new-password" hint="At least 10 characters, including a number." />

        <label className="flex items-start gap-2.5 text-[14px] leading-[21px] text-body">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded-[4px] accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold" />
          <span>
            Email me about new arrivals and collection drops. You can unsubscribe at any time.
          </span>
        </label>

        <Button type="submit" variant="primary" size="md" fullWidth>Create account</Button>
      </form>
    </AuthShell>
  )
}
