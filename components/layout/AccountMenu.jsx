'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, LogOut, User, UserRound } from 'lucide-react'

import { useAccount } from '@/components/auth/AccountProvider'
import { cn } from '@/utils/cn'

const ICON_BUTTON =
  'grid size-11 place-items-center rounded-full text-ink transition-colors duration-150 ease-out hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

const ITEM =
  'flex min-h-11 w-full items-center gap-3 rounded-media px-3 text-[15px] font-medium text-ink transition-colors hover:bg-surface-muted hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

/** Photo when the account has one (Google), initials otherwise. */
export function AccountAvatar({ account, size = 32 }) {
  if (account.avatarUrl) {
    return (
      <Image
        src={account.avatarUrl}
        alt=""
        width={size}
        height={size}
        unoptimized
        referrerPolicy="no-referrer"
        className="rounded-full object-cover"
      />
    )
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-ink text-[12px] font-bold text-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {account.initials}
    </span>
  )
}

/**
 * The header's account control (tablet and desktop — below md the same
 * options live in the drawer and bottom nav).
 *
 * Signed out it is the existing person icon, now pointing at sign-in. Signed
 * in it opens a small menu: account, the dashboard for staff, sign out.
 * Hairline card, no shadow (design.md §9). Escape and outside click close it.
 */
export default function AccountMenu({ className }) {
  const account = useAccount()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signedIn = account.status === 'customer' || account.status === 'admin'

  if (!signedIn) {
    return (
      <Link href="/login" aria-label="Sign in" className={cn(ICON_BUTTON, className)}>
        <User size={22} strokeWidth={2} aria-hidden="true" />
      </Link>
    )
  }

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${account.name}`}
        className={ICON_BUTTON}
      >
        <AccountAvatar account={account} size={30} />
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-card border border-border bg-surface p-2"
        >
          <div className="flex items-center gap-3 border-b border-border px-3 pb-3 pt-2">
            <AccountAvatar account={account} size={40} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-ink">{account.name}</p>
              <p className="truncate text-[13px] text-body">{account.email}</p>
            </div>
          </div>

          <ul className="mt-2 flex flex-col">
            <li>
              <Link href="/account" onClick={close} className={ITEM}>
                <UserRound size={18} aria-hidden="true" />
                My account
              </Link>
            </li>
            {account.status === 'admin' ? (
              <li>
                <Link href="/admin/dashboard" onClick={close} className={ITEM}>
                  <LayoutDashboard size={18} aria-hidden="true" />
                  Admin dashboard
                </Link>
              </li>
            ) : null}
            <li>
              <button
                type="button"
                onClick={() => {
                  close()
                  account.signOut()
                }}
                className={ITEM}
              >
                <LogOut size={18} aria-hidden="true" />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
