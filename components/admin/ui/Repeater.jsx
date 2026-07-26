'use client'

import { GripVertical, Plus, Trash2 } from 'lucide-react'

import AdminButton from './AdminButton'
import { cn } from '@/utils/cn'

/**
 * Add/remove/reorder rows of key–value pairs. Backs Specifications and
 * Attributes, which are structurally identical — one component, two labels.
 *
 * Rows carry a stable `id` so React keys never fall back to the array index
 * (reordering with index keys silently swaps input values).
 */
export default function Repeater({
  label,
  hint,
  rows = [],
  onChange,
  keyLabel = 'Label',
  valueLabel = 'Value',
  keyPlaceholder = 'Dimensions',
  valuePlaceholder = '55 × 30 × 27 cm',
  addLabel = 'Add row',
  className,
}) {
  const update = (id, patch) => onChange?.(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id) => onChange?.(rows.filter((r) => r.id !== id))
  const add = () => onChange?.([...rows, { id: `r${Date.now()}`, key: '', value: '' }])

  function move(index, delta) {
    const next = [...rows]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange?.(next)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-admin-sm font-semibold text-ink">{label}</span>
        <AdminButton size="xs" icon={Plus} onClick={add}>{addLabel}</AdminButton>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-badge border border-dashed border-border px-3 py-4 text-center text-admin-sm text-muted">
          No rows yet. Add one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-1.5">
              <span className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${row.key || 'row'} up`}
                  className="grid size-4 place-items-center text-muted transition-colors hover:text-ink disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                >
                  <GripVertical size={11} aria-hidden="true" />
                </button>
              </span>

              <label className="sr-only" htmlFor={`${row.id}-key`}>{keyLabel}</label>
              <input
                id={`${row.id}-key`}
                value={row.key}
                onChange={(e) => update(row.id, { key: e.target.value })}
                placeholder={keyPlaceholder}
                className="h-8 w-[38%] rounded-badge border border-border bg-surface px-2 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
              />

              <label className="sr-only" htmlFor={`${row.id}-value`}>{valueLabel}</label>
              <input
                id={`${row.id}-value`}
                value={row.value}
                onChange={(e) => update(row.id, { value: e.target.value })}
                placeholder={valuePlaceholder}
                className="h-8 flex-1 rounded-badge border border-border bg-surface px-2 text-admin text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
              />

              <AdminButton
                size="xs"
                variant="ghost"
                icon={Trash2}
                iconOnly
                aria-label={`Remove ${row.key || 'row'}`}
                onClick={() => remove(row.id)}
                className="hover:text-danger"
              />
            </li>
          ))}
        </ul>
      )}

      {hint ? <p className="text-admin-xs text-muted">{hint}</p> : null}
    </div>
  )
}
