'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import CopyField from '@/components/admin/ui/CopyField'
import { createUser, updateUser } from '@/lib/actions/users'
import { USER_STATUSES } from '@/constants/recordStatus'

const INITIAL = { ok: false, error: null, fieldErrors: {} }

/**
 * Create and edit are the same form — the only differences are which action it
 * posts to and whether a temporary password comes back, so forking it into two
 * components would mean maintaining every field twice.
 */
export default function UserForm({ user = null, basePath = '/admin/customers', noun = 'customer' }) {
  const editing = Boolean(user?.id)
  const [wholesale, setWholesale] = useState(Boolean(user?.isWholesaleApproved))
  const [state, formAction, pending] = useActionState(editing ? updateUser : createUser, INITIAL)
  const errors = state.fieldErrors ?? {}

  // Shown once, on screen only. This app never stores it.
  if (state.ok && state.tempPassword) {
    return (
      <>
        <AdminPageHeader title="Account created" description={`${state.email} can now sign in.`} />
        <AdminCard title="Temporary password" description="Shown once. Copy it now — it is not stored anywhere.">
          <div className="flex flex-col gap-3">
            <CopyField label="Email" value={state.email} />
            <CopyField label="Temporary password" value={state.tempPassword} />
            <AuthMessage tone="info">
              Ask them to change it after signing in. Sending it over chat or email puts it somewhere
              you cannot delete it from.
            </AuthMessage>
            <div className="flex gap-2">
              <AdminButton href={basePath} variant="primary" size="md">Back to {noun}s</AdminButton>
              <AdminButton href={`${basePath}/new`} size="md">Add another</AdminButton>
            </div>
          </div>
        </AdminCard>
      </>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {editing ? <input type="hidden" name="id" value={user.id} /> : null}
      {/* Photos come from the customer's own sign-in (e.g. Google); kept as-is. */}
      <input type="hidden" name="avatarUrl" value={user?.avatarUrl ?? ''} />
      {wholesale ? <input type="hidden" name="isWholesaleApproved" value="on" /> : null}

      {state.error ? <AuthMessage tone="error">{state.error}</AuthMessage> : null}
      {state.ok && editing ? <AuthMessage tone="success">Changes saved.</AuthMessage> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <AdminCard title="Details" description="Name and contact information.">
          <div className="flex flex-col gap-3.5">
            <AdminField
              id="name" name="name" label="Full name" required
              defaultValue={user?.name ?? ''} error={errors.name}
              placeholder="Ada Lovelace"
            />
            <AdminField
              id="email" name="email" label="Email address" type="email" required
              defaultValue={user?.email ?? ''} error={errors.email}
              hint={editing ? 'Changing this changes the address they sign in with.' : 'Used as the sign-in address.'}
              placeholder="ada@knocknationbag.com"
            />
            <AdminField
              id="phone" name="phone" label="Phone" type="tel"
              defaultValue={user?.phone ?? ''} error={errors.phone}
              hint="Optional." placeholder="+44 20 7946 0000"
            />
          </div>
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard title="Wholesale">
            <AdminToggle
              id="wholesale"
              label="Approved wholesale"
              hint="Sees wholesale prices on products that have one, when buying at least the minimum quantity."
              checked={wholesale}
              onChange={setWholesale}
            />
          </AdminCard>

          <AdminCard title="Status">
            <AdminField id="status" name="status" as="select" label="Account status" defaultValue={user?.status ?? 'Active'}
              hint="Inactive accounts lose wholesale pricing.">
              {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </AdminField>
          </AdminCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton type="submit" variant="primary" size="md" icon={Save} disabled={pending}>
          {pending ? 'Saving…' : editing ? 'Save changes' : `Create ${noun}`}
        </AdminButton>
        <Link
          href={basePath}
          className="text-admin-sm font-medium text-body underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
