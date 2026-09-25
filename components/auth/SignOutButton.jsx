'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'

import Button from '@/components/ui/Button'
import { useAccount } from './AccountProvider'

/** Signs out through the shared account context, so the header updates too. */
export default function SignOutButton({ className }) {
  const { signOut } = useAccount()
  const [pending, setPending] = useState(false)

  return (
    <Button
      variant="secondary"
      size="md"
      icon={LogOut}
      disabled={pending}
      className={className}
      onClick={async () => {
        setPending(true)
        await signOut()
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
