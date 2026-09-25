'use client'

import { useActionState } from 'react'

import AuthNotice from './AuthNotice'
import { resendConfirmation } from '@/lib/auth/customerActions'

const INITIAL = { ok: false, error: null }

/** "Send the confirmation email again", for sign-ups that never arrived. */
export default function ResendConfirmation({ email }) {
  const [state, formAction, pending] = useActionState(resendConfirmation, INITIAL)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      {state.resent ? (
        <AuthNotice tone="success">If that address needs confirming, a new link is on its way.</AuthNotice>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="self-start text-[14px] font-semibold text-ink underline underline-offset-4 transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Resend confirmation email'}
        </button>
      )}
      <AuthNotice tone="error">{state.error}</AuthNotice>
    </form>
  )
}
