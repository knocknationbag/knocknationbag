'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import AdminField from '@/components/admin/ui/AdminField'

/**
 * Password input with a show/hide toggle, built on AdminField so it inherits
 * the label, hint and error wiring rather than reimplementing them.
 *
 * `aria-pressed` carries the state, so the toggle is not signalled by icon
 * alone. Visibility is local and never leaves the component.
 */
export default function PasswordField({
  id,
  label,
  hint,
  error,
  autoComplete = 'current-password',
  ...props
}) {
  const [visible, setVisible] = useState(false)

  return (
    <AdminField
      id={id}
      label={label}
      hint={hint}
      error={error}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      adornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-badge text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
        >
          {visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  )
}
