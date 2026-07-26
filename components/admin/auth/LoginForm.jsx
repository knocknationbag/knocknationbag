'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

import AdminField from '@/components/admin/ui/AdminField'
import AdminButton from '@/components/admin/ui/AdminButton'
import AuthMessage from './AuthMessage'
import PasswordField from './PasswordField'
import { signIn } from '@/lib/auth/actions'

const INITIAL = { ok: false, error: null }

/**
 * Email + password sign-in.
 *
 * The action is a Server Action, so credentials are posted directly to the
 * server and the session comes back as an httpOnly cookie set by @supabase/ssr.
 * No token is ever handled in client code, and there is nothing in
 * localStorage for an XSS to read.
 *
 * `next` is carried in a hidden field so an interrupted deep link resumes after
 * sign-in. It is sanitised server-side — see safeNextPath in lib/auth/routes.js.
 */
export default function LoginForm({ next = '', notice }) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL)

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {notice ? <AuthMessage tone="info">{notice}</AuthMessage> : null}
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

      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <Link
          href="/admin/forgot-password"
          className="self-end text-admin-xs font-medium text-body underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Forgot your password?
        </Link>
      </div>

      <AdminButton
        type="submit"
        variant="primary"
        size="md"
        icon={LogIn}
        disabled={pending}
        className="mt-1 w-full"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </AdminButton>
    </form>
  )
}
