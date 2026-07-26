'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut, Settings, ShieldCheck } from 'lucide-react'

import { signOut } from '@/lib/auth/actions'
import { cn } from '@/utils/cn'

/**
 * Account menu in the topbar: who you are, what role you hold, and the way out.
 *
 * Sign-out is a form posting to a Server Action, not a click handler. The
 * session lives in an httpOnly cookie precisely so client JavaScript cannot
 * touch it, which means only the server can clear it.
 */
export default function AdminUserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const itemClass =
    'flex w-full items-center gap-2 rounded-badge px-2 py-1.5 text-admin text-body transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold'

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-badge border-l border-border py-1 pl-3 pr-1 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-admin-xs font-bold text-white"
          aria-hidden="true"
        >
          {user.initials}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-admin-sm font-semibold text-ink">{user.name}</span>
          <span className="block text-admin-xs text-muted">{user.roleLabel}</span>
        </span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[232px] rounded-media border border-border bg-surface p-2 shadow-lg"
        >
          <div className="border-b border-border px-2 pb-2">
            <p className="truncate text-admin font-semibold text-ink">{user.name}</p>
            <p className="truncate text-admin-xs text-muted">{user.email}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-badge bg-surface-muted px-1.5 py-0.5 text-admin-xs font-medium text-body">
              <ShieldCheck size={11} aria-hidden="true" /> {user.roleLabel}
            </p>
          </div>

          {user.isPreview ? (
            <p className="mt-2 rounded-badge bg-danger/5 px-2 py-1.5 text-admin-xs leading-[15px] text-danger">
              Preview mode — Supabase is not configured, so no one is really signed in.
            </p>
          ) : null}

          <div className="mt-2 flex flex-col gap-0.5">
            <Link href="/admin/settings" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <Settings size={14} aria-hidden="true" /> Settings
            </Link>

            <form action={signOut}>
              <button type="submit" role="menuitem" className={cn(itemClass, 'hover:bg-danger/5 hover:text-danger')}>
                <LogOut size={14} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
