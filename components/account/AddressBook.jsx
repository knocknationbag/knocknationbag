'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AuthNotice from '@/components/auth/AuthNotice'
import AddressFields from '@/components/checkout/AddressFields'
import { deleteAddress, saveAddress, setDefaultAddress } from '@/lib/account/actions'
import { formatAddress } from '@/lib/checkout/validation'

const INITIAL = { ok: false, error: null, fieldErrors: {}, values: {} }

const toValues = (a) => (a
  ? { fullName: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, pincode: a.pincode }
  : {})

function AddressForm({ address, onDone }) {
  const [state, formAction, pending] = useActionState(saveAddress, INITIAL)

  useEffect(() => {
    if (state.ok) onDone()
  }, [state.ok, onDone])

  return (
    <form action={formAction} className="rounded-card border border-border bg-surface p-5 xl:p-6" noValidate>
      <input type="hidden" name="id" value={address?.id ?? ''} />
      {state.error ? <AuthNotice tone="error" className="mb-5">{state.error}</AuthNotice> : null}
      <AddressFields values={{ ...toValues(address), ...state.values }} errors={state.fieldErrors} idPrefix={`ab-${address?.id ?? 'new'}`} />
      <label className="mt-4 flex items-center gap-2.5 text-[14px] text-body">
        <input type="checkbox" name="isDefault" defaultChecked={address?.is_default} className="size-4 accent-[#111827]" />
        Use as my default address
      </label>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" variant="primary" size="md" disabled={pending}>{pending ? 'Saving…' : 'Save address'}</Button>
        <Button type="button" variant="secondary" size="md" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

/** Saved delivery addresses: add, edit, delete, choose the default. */
export default function AddressBook({ addresses }) {
  const router = useRouter()
  const [editing, setEditing] = useState(null) // address id, 'new', or null
  const [pending, startTransition] = useTransition()

  const done = () => {
    setEditing(null)
    router.refresh()
  }
  const run = (action) => startTransition(async () => {
    await action()
    router.refresh()
  })

  return (
    <div className="flex flex-col gap-4">
      <h2 className="sr-only">Saved addresses</h2>
      {addresses.length === 0 && editing !== 'new' ? (
        <p className="text-[15px] text-body">No saved addresses yet. Add one here, or tick “Save this address” at checkout.</p>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className={editing === a.id ? 'md:col-span-2' : undefined}>
            {editing === a.id ? (
              <AddressForm address={a} onDone={done} />
            ) : (
              <div className={`h-full rounded-card border border-border bg-surface p-6 ${pending ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[16px] font-bold text-ink">{a.full_name}</h3>
                  {a.is_default ? <Badge variant="verified">Default</Badge> : null}
                </div>
                <p className="mt-2 text-[15px] leading-[24px] text-body">{formatAddress(a)}</p>
                <p className="text-[15px] text-body">{a.phone}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold">
                  <button type="button" onClick={() => setEditing(a.id)} className="text-ink underline-offset-4 hover:text-gold hover:underline">Edit</button>
                  {a.is_default ? null : (
                    <button type="button" onClick={() => run(() => setDefaultAddress(a.id))} className="text-ink underline-offset-4 hover:text-gold hover:underline">Make default</button>
                  )}
                  <button type="button" onClick={() => run(() => deleteAddress(a.id))} className="text-body underline-offset-4 hover:text-danger hover:underline">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {editing === 'new' ? (
        <AddressForm onDone={done} />
      ) : (
        <Button variant="secondary" size="md" icon={Plus} className="self-start" onClick={() => setEditing('new')}>
          Add a new address
        </Button>
      )}
    </div>
  )
}
