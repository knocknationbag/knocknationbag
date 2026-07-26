'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { KeyRound } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import AuthMessage from './AuthMessage'
import PasswordField from './PasswordField'
import { updatePassword } from '@/lib/auth/actions'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/authErrors'

const INITIAL = { ok: false, error: null }

/**
 * Sets a new password.
 *
 * Reachable only with the session the recovery link created — the action
 * re-checks that server-side rather than trusting the page to have been
 * reached legitimately.
 */
export default function ResetPasswordForm({ hasRecoverySession = false }) {
  const [state, formAction, pending] = useActionState(updatePassword, INITIAL)

  if (!hasRecoverySession) {
    return (
      <div className="flex flex-col gap-4">
        <AuthMessage tone="error">
          This page opens from the link in a password reset email. That link has expired, has
          already been used, or was never opened in this browser.
        </AuthMessage>
        <AdminButton href="/admin/forgot-password" variant="primary" size="md" className="w-full">
          Request a new link
        </AdminButton>
        <Link
          href="/admin/login"
          className="text-admin-sm font-medium text-body underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthMessage tone="error">{state.error}</AuthMessage>

      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters. A long passphrase beats a short complex one.`}
        placeholder="••••••••"
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        placeholder="••••••••"
      />

      <AuthMessage tone="info">
        Saving signs you out of every other device.
      </AuthMessage>

      <AdminButton
        type="submit"
        variant="primary"
        size="md"
        icon={KeyRound}
        disabled={pending}
        className="w-full"
      >
        {pending ? 'Saving…' : 'Save new password'}
      </AdminButton>
    </form>
  )
}
