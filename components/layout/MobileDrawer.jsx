'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import Logo from '@/components/common/Logo'
import { cn } from '@/utils/cn'

/**
 * Slide-in navigation panel below md. Holds the full 8-item nav so nothing is
 * removed from the site on mobile — docs/responsive.md §4.1.
 * Traps focus, closes on Escape and backdrop click, restores focus on close.
 */
export default function MobileDrawer({ open, onClose, items, actions, activeHref }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('a, button')?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  return (
    <div className={cn('md:hidden', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ink/40 transition-opacity duration-250',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-label="Site navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-[320px] flex-col bg-surface',
          'transition-transform duration-250 [transition-timing-function:var(--ease-out-soft)]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Logo size={30} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-11 place-items-center rounded-full text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <X size={22} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = item.href === activeHref
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-lg px-3 text-[17px] font-medium transition-colors',
                      isActive ? 'text-gold' : 'text-ink hover:text-gold',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <ul className="mt-6 flex flex-col gap-1 border-t border-border pt-6">
            {actions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center rounded-lg px-3 text-[15px] text-body transition-colors hover:text-gold"
                >
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
