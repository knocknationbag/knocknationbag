'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import AuthNotice from '@/components/auth/AuthNotice'
import { updateProfile } from '@/lib/account/actions'

const INITIAL = { ok: false, error: null, fieldErrors: {}, values: {} }

/** Name and mobile number. Email is the sign-in address and changes via support. */
export default function ProfileForm({ profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, INITIAL)
  const values = { fullName: profile.name, phone: profile.phone ?? '', ...state.values }

  return (
    <form action={formAction} className="flex max-w-[520px] flex-col gap-5" noValidate>
      <h2 className="sr-only">Your details</h2>
      {state.ok ? <AuthNotice tone="success">Your details have been saved.</AuthNotice> : null}
      {state.error ? <AuthNotice tone="error">{state.error}</AuthNotice> : null}

      <Field id="pf-name" name="fullName" label="Full name" autoComplete="name" defaultValue={values.fullName} error={state.fieldErrors?.fullName} required />
      <Field id="pf-phone" name="phone" type="tel" inputMode="tel" label="Mobile number" autoComplete="tel"
        defaultValue={values.phone} error={state.fieldErrors?.phone} hint="Optional. Used to pre-fill checkout." />
      <Field id="pf-email" label="Email address" defaultValue={profile.email} disabled hint="This is your sign-in address." />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="md" disabled={pending}>{pending ? 'Saving…' : 'Save details'}</Button>
        <Link href="/reset-password" className="text-[14px] font-semibold text-ink underline underline-offset-4 hover:text-gold">Change password</Link>
      </div>
    </form>
  )
}
