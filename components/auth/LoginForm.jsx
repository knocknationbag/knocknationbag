'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import AuthNotice from './AuthNotice'
import PasswordInput from './PasswordInput'
import ResendConfirmation from './ResendConfirmation'
import { customerSignIn } from '@/lib/auth/customerActions'

const INITIAL = { ok: false, error: null }

/**
 * Storefront email + password sign-in. Posts to a Server Action; the session
 * comes back as httpOnly cookies. `next` is sanitised server-side.
 */
export default function LoginForm({ next = '', defaultEmail = '', notice }) {
  const [state, formAction, pending] = useActionState(customerSignIn, INITIAL)

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <input type="hidden" name="next" value={next} />

        {notice && !state.error ? <AuthNotice tone={notice.tone}>{notice.text}</AuthNotice> : null}
        <AuthNotice tone="error">{state.error}</AuthNotice>

        <Field
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          defaultValue={state.email ?? defaultEmail}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            id="login-password"
            name="password"
            label="Password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
          <Link
            href="/forgot-password"
            className="self-end text-[14px] font-semibold text-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {state.unconfirmed ? <ResendConfirmation email={state.email} /> : null}
    </div>
  )
}
