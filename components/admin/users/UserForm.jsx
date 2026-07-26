'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { MediaPickerField } from '@/components/admin/media/MediaPicker'
import CopyField from '@/components/admin/ui/CopyField'
import { createUser, updateUser } from '@/lib/actions/users'
import { USER_STATUSES } from '@/constants/recordStatus'

const INITIAL = { ok: false, error: null, fieldErrors: {} }

/**
 * Create and edit are the same form — the only differences are which action it
 * posts to and whether a temporary password comes back, so forking it into two
 * components would mean maintaining every field twice.
 */
export default function UserForm({ user = null }) {
  const editing = Boolean(user?.id)
  // The picker is a dialog, not an <input>, so its value rides along in a
  // hidden field rather than being read from the DOM.
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? '')
  const [state, formAction, pending] = useActionState(editing ? updateUser : createUser, INITIAL)
  const errors = state.fieldErrors ?? {}

  // Shown once, on screen only. This app never stores it.
  if (state.ok && state.tempPassword) {
    return (
      <>
        <AdminPageHeader title="User created" description={`${state.email} can now sign in.`} />
        <AdminCard title="Temporary password" description="Shown once. Copy it now — it is not stored anywhere.">
          <div className="flex flex-col gap-3">
            <CopyField label="Email" value={state.email} />
            <CopyField label="Temporary password" value={state.tempPassword} />
            <AuthMessage tone="info">
              Ask them to change it after signing in. Sending it over chat or email puts it somewhere
              you cannot delete it from.
            </AuthMessage>
            <div className="flex gap-2">
              <AdminButton href="/admin/users" variant="primary" size="md">Back to users</AdminButton>
              <AdminButton href="/admin/users/new" size="md">Add another</AdminButton>
            </div>
          </div>
        </AdminCard>
      </>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {editing ? <input type="hidden" name="id" value={user.id} /> : null}
      <input type="hidden" name="avatarUrl" value={avatar} />

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
          <AdminCard title="Profile image">
            <MediaPickerField
              id="avatar" label="Profile image" hint="Square images work best."
              value={avatar} onChange={setAvatar}
            />
          </AdminCard>

          <AdminCard title="Status">
            <AdminField id="status" name="status" as="select" label="Account status" defaultValue={user?.status ?? 'Active'}>
              {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </AdminField>
          </AdminCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton type="submit" variant="primary" size="md" icon={Save} disabled={pending}>
          {pending ? 'Saving…' : editing ? 'Save changes' : 'Create user'}
        </AdminButton>
        <Link
          href="/admin/users"
          className="text-admin-sm font-medium text-body underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
