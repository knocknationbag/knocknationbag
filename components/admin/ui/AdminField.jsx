import { cn } from '@/utils/cn'

const CONTROL =
  'w-full rounded-badge border border-border bg-surface px-2.5 text-admin text-ink placeholder:text-muted ' +
  'transition-colors focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70'

/**
 * Compact labelled control for admin forms. Renders input | textarea | select.
 *
 * `counter` shows a live character count against a recommended maximum — used
 * throughout the SEO panel, where length directly affects how Google and social
 * cards truncate. Amber past the ideal, red past the hard limit.
 */
export default function AdminField({
  as = 'input',
  id,
  label,
  hint,
  error,
  required = false,
  counter,
  value,
  adornment,
  className,
  children,
  ...props
}) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ')
  const len = typeof value === 'string' ? value.length : 0
  const over = counter ? len > counter.max : false
  const near = counter ? !over && len > counter.ideal : false

  const shared = {
    id,
    value,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
    required: required || undefined,
    ...props,
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-admin-sm font-semibold text-ink">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>

        {counter ? (
          <span
            className={cn(
              'shrink-0 font-mono text-admin-xs tabular-nums',
              over ? 'text-danger' : near ? 'text-[#8A6D1F]' : 'text-muted',
            )}
          >
            {len}/{counter.ideal}
            {over ? ` · max ${counter.max}` : ''}
          </span>
        ) : null}
      </div>

      {as === 'textarea' ? (
        <textarea {...shared} rows={props.rows ?? 3} className={cn(CONTROL, 'min-h-[68px] py-2 leading-[20px]', error && 'border-danger')} />
      ) : as === 'select' ? (
        <select {...shared} className={cn(CONTROL, 'h-9 appearance-none pr-8', error && 'border-danger')}>
          {children}
        </select>
      ) : adornment ? (
        // Trailing control inside the field — the password show/hide toggle.
        // Extra right padding so a long value never runs under the button.
        <div className="relative">
          <input {...shared} className={cn(CONTROL, 'h-9 pr-9', error && 'border-danger')} />
          {adornment}
        </div>
      ) : (
        <input {...shared} className={cn(CONTROL, 'h-9', error && 'border-danger')} />
      )}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-admin-xs text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-admin-xs font-medium text-danger">{error}</p>
      ) : null}
    </div>
  )
}

/** Compact switch used for booleans (Featured, Index, Follow, Published). */
export function AdminToggle({ id, label, hint, checked, onChange, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-admin-sm font-semibold text-ink">{label}</label>
        {hint ? <p className="mt-0.5 text-admin-xs text-muted">{hint}</p> : null}
      </div>

      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
          checked ? 'bg-ink' : 'bg-border',
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  )
}
