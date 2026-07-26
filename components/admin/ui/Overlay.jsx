'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

import AdminButton from './AdminButton'
import { cn } from '@/utils/cn'

/**
 * Shared dismissible-overlay behaviour: focus trap, Escape to close, backdrop
 * click, scroll lock, focus restored on close. Modal, SideDrawer and
 * ConfirmDialog all build on this so accessibility is implemented once.
 */
function useOverlay(open, onClose) {
  const ref = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector('input,select,textarea,button,a[href]')?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') { onClose?.(); return }
      if (event.key !== 'Tab') return

      const focusables = ref.current?.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  return ref
}

function Backdrop({ onClose }) {
  return <div className="fixed inset-0 z-[80] bg-ink/45" onClick={onClose} />
}

function CloseButton({ onClose, label = 'Close' }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="-mr-1 grid size-8 shrink-0 place-items-center rounded-badge text-body transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
    >
      <X size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  )
}

const MODAL_WIDTHS = { sm: 'max-w-[420px]', md: 'max-w-[560px]', lg: 'max-w-[760px]', xl: 'max-w-[1000px]' }

/** Centred dialog. */
export function Modal({ open, onClose, title, description, size = 'md', footer, children }) {
  const ref = useOverlay(open, onClose)
  if (!open) return null

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 md:items-center">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn('w-full rounded-media border border-border bg-surface', MODAL_WIDTHS[size])}
        >
          <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-admin-lg font-bold text-ink">{title}</h2>
              {description ? <p className="mt-0.5 text-admin-sm text-body">{description}</p> : null}
            </div>
            <CloseButton onClose={onClose} />
          </header>

          <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>

          {footer ? (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </>
  )
}

/** Right-hand drawer — used for filters, quick edit and record detail. */
export function SideDrawer({ open, onClose, title, description, footer, width = 'md', children }) {
  const ref = useOverlay(open, onClose)
  if (!open) return null
  const widths = { sm: 'max-w-[360px]', md: 'max-w-[480px]', lg: 'max-w-[640px]' }

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('fixed inset-y-0 right-0 z-[90] flex w-full flex-col border-l border-border bg-surface', widths[width])}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-admin-lg font-bold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-admin-sm text-body">{description}</p> : null}
          </div>
          <CloseButton onClose={onClose} />
        </header>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </>
  )
}

/** Destructive-action confirmation. Never wire a delete without one. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <AdminButton variant="secondary" size="sm" onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant={tone} size="sm" onClick={onConfirm}>{confirmLabel}</AdminButton>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-danger/10">
          <AlertTriangle size={16} strokeWidth={2} className="text-danger" aria-hidden="true" />
        </span>
        <p className="text-admin leading-[20px] text-body">
          {description ?? 'This action cannot be undone.'}
        </p>
      </div>
    </Modal>
  )
}
