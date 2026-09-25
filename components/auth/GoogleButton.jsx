'use client'

import { useActionState } from 'react'
import Image from 'next/image'

import Button from '@/components/ui/Button'
import AuthNotice from './AuthNotice'
import { signInWithGoogle } from '@/lib/auth/customerActions'

const INITIAL = { ok: false, error: null }

/**
 * "Continue with Google" — Supabase OAuth, not a custom integration.
 *
 * A form, so it works before hydration. The action builds the Supabase
 * authorize URL (setting the PKCE verifier cookie) and redirects to it; Google
 * then returns through /auth/callback. Uses the site's secondary Button.
 */
export default function GoogleButton({ next = '', label = 'Continue with Google' }) {
  const [state, formAction, pending] = useActionState(signInWithGoogle, INITIAL)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <Button type="submit" variant="secondary" size="md" fullWidth disabled={pending} className="gap-3">
        <Image src="/icons/google-g.svg" alt="" width={18} height={18} unoptimized aria-hidden="true" />
        {pending ? 'Redirecting to Google…' : label}
      </Button>
      <AuthNotice tone="error">{state.error}</AuthNotice>
    </form>
  )
}
