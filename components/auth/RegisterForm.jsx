'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import AuthNotice from './AuthNotice'
import PasswordInput from './PasswordInput'
import ResendConfirmation from './ResendConfirmation'
import { customerSignUp } from '@/lib/auth/customerActions'
import { MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '@/lib/auth/authErrors'

const INITIAL = { ok: false, error: null }

const LINK = 'font-semibold text-ink underline underline-offset-4 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

/**
 * Storefront sign-up. Supabase creates the account; the database trigger
 * creates the profile from the full name sent as user metadata.
 *
 * Three outcomes besides a validation error: the address already has an
 * account (offer sign-in), a confirmation email was sent (this project), or —
 * with confirmation switched off — the action signs in and redirects.
 */
export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(customerSignUp, INITIAL)

  if (state.ok && state.needsConfirmation) {
    return (
      <div className="flex flex-col gap-5">
        <AuthNotice tone="success">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1">
            We sent a confirmation link to <strong>{state.email}</strong>. Open it to activate your
            account — then you are signed in automatically.
          </p>
        </AuthNotice>
        <ResendConfirmation email={state.email} />
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthNotice tone="error">{state.error}</AuthNotice>

      {state.exists ? (
        <AuthNotice tone="info">
          <p className="font-semibold text-ink">An account already exists for {state.email}.</p>
          <p className="mt-1">
            <Link href={`/login?email=${encodeURIComponent(state.email)}`} className={LINK}>
              Sign in instead
            </Link>{' '}
            — or use Continue with Google if that is how you joined. Forgotten your password?{' '}
            <Link href="/forgot-password" className={LINK}>
              Reset it
            </Link>
            .
          </p>
        </AuthNotice>
      ) : null}

      <Field
        id="reg-name"
        name="fullName"
        label="Full name"
        autoComplete="name"
        required
        maxLength={MAX_NAME_LENGTH}
        defaultValue={state.fullName ?? ''}
      />
      <Field
        id="reg-email"
        name="email"
        type="email"
        label="Email address"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        defaultValue={state.email ?? ''}
      />
      <PasswordInput
        id="reg-password"
        name="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
      />
      <PasswordInput
        id="reg-confirm"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
      />

      <Button type="submit" variant="primary" size="md" fullWidth disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
