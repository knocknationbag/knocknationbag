'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

import AdminField from '@/components/admin/ui/AdminField'
import AdminButton from '@/components/admin/ui/AdminButton'
import AuthMessage from './AuthMessage'
import { requestPasswordReset } from '@/lib/auth/actions'

const INITIAL = { ok: false, error: null }

/**
 * Requests a password reset email.
 *
 * The confirmation is identical whether or not the address has an account.
 * "No user found with that email" would turn this form into a way of testing
 * which staff addresses exist, so the only errors surfaced are validation and
 * rate limiting.
 */
export default function ForgotPasswordForm({ linkExpired = false }) {
  const [state, formAction, pending] = useActionState(requestPasswordReset, INITIAL)

  const backLink = (
    <Link
      href="/admin/login"
      className="inline-flex items-center gap-1.5 text-admin-sm font-medium text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <ArrowLeft size={13} aria-hidden="true" /> Back to sign in
    </Link>
  )

  if (state.ok) {
    return (
      <div className="flex flex-col gap-4">
        <AuthMessage tone="success">
          If an account exists for <strong className="font-semibold">{state.email}</strong>, a reset
          link is on its way. It expires in one hour.
        </AuthMessage>
        <p className="text-admin-sm leading-[18px] text-body">
          Nothing after a few minutes? Check the spam folder, then confirm you used the address your
          account was created with.
        </p>
        {backLink}
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {linkExpired ? (
        <AuthMessage tone="error">
          That reset link has expired or has already been used. Request a new one below.
        </AuthMessage>
      ) : null}
      <AuthMessage tone="error">{state.error}</AuthMessage>

      <AdminField
        id="email"
        name="email"
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoFocus
        required
        placeholder="you@knocknationbag.com"
        defaultValue={state.email ?? ''}
      />

      <AdminButton
        type="submit"
        variant="primary"
        size="md"
        icon={Send}
        disabled={pending}
        className="w-full"
      >
        {pending ? 'Sending…' : 'Send reset link'}
      </AdminButton>

      {backLink}
    </form>
  )
}
