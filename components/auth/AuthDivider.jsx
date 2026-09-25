/** Hairline with a centred label, between Google and the email form. */
export default function AuthDivider({ label = 'or' }) {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <span className="font-mono text-eyebrow uppercase text-body" aria-hidden="true">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  )
}
