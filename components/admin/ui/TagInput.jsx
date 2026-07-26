'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * Token input for tags. Enter or comma commits, Backspace on an empty field
 * removes the last token. Duplicates are rejected silently.
 */
export default function TagInput({ id, label, hint, value = [], onChange, placeholder = 'Add a tag…', suggestions = [], className }) {
  const [draft, setDraft] = useState('')

  function commit(raw) {
    const tag = raw.trim().replace(/,$/, '')
    if (!tag) return
    if (!value.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange?.([...value, tag])
    setDraft('')
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange?.(value.slice(0, -1))
    }
  }

  const unused = suggestions.filter((s) => !value.some((t) => t.toLowerCase() === s.toLowerCase()))

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-admin-sm font-semibold text-ink">{label}</label>

      <div className="flex flex-wrap items-center gap-1.5 rounded-badge border border-border bg-surface p-1.5 focus-within:border-ink">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-badge bg-surface-muted px-2 py-0.5 text-admin-sm font-medium text-ink">
            {tag}
            <button
              type="button"
              onClick={() => onChange?.(value.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="text-muted transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
            >
              <X size={11} aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-0.5 text-admin text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {unused.length ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-admin-xs text-muted">Suggested:</span>
          {unused.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="rounded-badge border border-border px-1.5 py-0.5 text-admin-xs text-body transition-colors hover:border-border-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}

      {hint ? <p className="text-admin-xs text-muted">{hint}</p> : null}
    </div>
  )
}
