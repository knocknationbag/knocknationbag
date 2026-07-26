import { cn } from '@/utils/cn'

const CONTROL =
  'w-full rounded-full border border-border bg-white px-6 text-[15px] text-ink placeholder:text-muted ' +
  'transition-colors focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Labelled form control. Every input on the site goes through this, so no field
 * ever ships without a label (docs/accessibility.md §6).
 * `as` renders input | textarea | select.
 */
export default function Field({
  as = 'input',
  id,
  label,
  hideLabel = false,
  error,
  hint,
  className,
  children,
  ...props
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ')

  const shared = {
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
    ...props,
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className={cn(
          'text-[14px] font-semibold text-ink',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>

      {as === 'textarea' ? (
        <textarea
          {...shared}
          rows={props.rows ?? 5}
          className={cn(CONTROL, 'min-h-32 rounded-card py-4', error && 'border-danger')}
        />
      ) : as === 'select' ? (
        <select {...shared} className={cn(CONTROL, 'h-12 appearance-none pr-12', error && 'border-danger')}>
          {children}
        </select>
      ) : (
        <input {...shared} className={cn(CONTROL, 'h-12', error && 'border-danger')} />
      )}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[13px] text-body">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
