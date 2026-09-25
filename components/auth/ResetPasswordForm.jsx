'use client'

import { useActionState } from 'react'

import Button from '@/components/ui/Button'
import AuthNotice from './AuthNotice'
import PasswordInput from './PasswordInput'
import { customerUpdatePassword } from '@/lib/auth/customerActions'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/authErrors'

const INITIAL = { ok: false, error: null }

/**
 * Sets a new password. The recovery link created the session this relies on;
 * the page shows the expired state instead when there is none, and the action
 * re-checks server-side regardless.
 */
export default function ResetPasswordForm({ hasRecoverySession = false }) {
  const [state, formAction, pending] = useActionState(customerUpdatePassword, INITIAL)

  if (!hasRecoverySession) {
    return (
      <div className="flex flex-col gap-5">
        <AuthNotice tone="error">
          This reset link has expired, has already been used, or was opened in a different browser.
        </AuthNotice>
        <Button href="/forgot-password" variant="primary" size="md" fullWidth>
          Request a new link
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthNotice tone="error">{state.error}</AuthNotice>

      <PasswordInput
        id="reset-password"
        name="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
      />
      <PasswordInput
        id="reset-confirm"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
      />

      <AuthNotice tone="info">Saving signs you out on every other device.</AuthNotice>

      <Button type="submit" variant="primary" size="md" fullWidth disabled={pending}>
        {pending ? 'Saving…' : 'Save new password'}
      </Button>
    </form>
  )
}
