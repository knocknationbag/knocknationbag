'use client'

import { useActionState } from 'react'
import { Check } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import { updateStock } from '@/lib/actions/products'
import { cn } from '@/utils/cn'

/**
 * One inline "set stock" control — for a product without variants, or for a
 * single variant. Saving recomputes the product total and status server-side.
 */
export default function StockEditor({ kind, id, stock, label }) {
  const [state, formAction, pending] = useActionState(updateStock, { ok: false, error: null })
  const current = state.ok ? state.stock : stock

  return (
    <form action={formAction} className="flex items-center justify-end gap-1.5">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`stock-${id}`}>Stock for {label}</label>
      <input
        id={`stock-${id}`}
        name="stock"
        type="number"
        min="0"
        step="1"
        defaultValue={current}
        key={current}
        aria-invalid={state.error ? 'true' : undefined}
        className={cn(
          'h-8 w-20 rounded-badge border border-border bg-surface px-2 text-right text-admin tabular-nums text-ink',
          'focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
          state.error && 'border-danger',
        )}
      />
      <AdminButton type="submit" size="sm" icon={Check} iconOnly aria-label={`Save stock for ${label}`} disabled={pending} />
      <span role="status" className="w-10 text-admin-xs">
        {state.error ? <span className="text-danger">Error</span> : state.ok ? <span className="text-verified-fg">Saved</span> : null}
      </span>
    </form>
  )
}
