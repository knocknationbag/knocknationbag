'use client'

import { useActionState } from 'react'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import AuthNotice from './AuthNotice'
import { customerRequestPasswordReset } from '@/lib/auth/customerActions'

const INITIAL = { ok: false, error: null }

/**
 * Requests a reset email. The confirmation reads the same whether or not the
 * address has an account, so the form cannot be used to discover customers.
 */
export default function ForgotPasswordForm({ notice }) {
  const [state, formAction, pending] = useActionState(customerRequestPasswordReset, INITIAL)

  if (state.ok) {
    return (
      <AuthNotice tone="success">
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-1">
          If an account exists for <strong>{state.email}</strong>, a reset link is on its way. It
          expires after one hour.
        </p>
      </AuthNotice>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {notice && !state.error ? <AuthNotice tone={notice.tone}>{notice.text}</AuthNotice> : null}
      <AuthNotice tone="error">{state.error}</AuthNotice>

      <Field
        id="fp-email"
        name="email"
        type="email"
        label="Email address"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        defaultValue={state.email ?? ''}
      />
      <Button type="submit" variant="primary" size="md" fullWidth disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  )
}
