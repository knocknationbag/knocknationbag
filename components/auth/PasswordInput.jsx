'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import Field from '@/components/ui/Field'

/**
 * Field with a show/hide toggle. `aria-pressed` carries the state so it is not
 * signalled by the icon alone. Visibility never leaves this component.
 */
export default function PasswordInput({ autoComplete = 'current-password', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <Field
      {...props}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      adornment={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  )
}
