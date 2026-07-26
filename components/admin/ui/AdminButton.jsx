import Link from 'next/link'

import { cn } from '@/utils/cn'

/**
 * Compact button for the dashboard.
 *
 * The storefront Button is a 52px marketing pill — far too large for a toolbar.
 * Same colours, same rounded-badge radius, same focus ring; only the scale
 * differs, matching the admin density target (docs/admin.md).
 */
const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  gold: 'bg-gold text-ink hover:brightness-95',
  secondary: 'border border-border bg-surface text-ink hover:border-border-hover',
  ghost: 'text-body hover:bg-surface-muted hover:text-ink',
  danger: 'border border-danger/30 bg-danger/5 text-danger hover:bg-danger/10',
}

const SIZES = {
  xs: 'h-7 gap-1 px-2 text-admin-xs',
  sm: 'h-8 gap-1.5 px-2.5 text-admin-sm',
  md: 'h-9 gap-1.5 px-3 text-admin',
}

export default function AdminButton({
  variant = 'secondary',
  size = 'sm',
  href,
  icon: Icon,
  iconOnly = false,
  className,
  children,
  type = 'button',
  ...props
}) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-badge font-semibold whitespace-nowrap',
    'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    iconOnly && 'aspect-square px-0',
    className,
  )

  const content = (
    <>
      {Icon ? <Icon size={size === 'xs' ? 13 : 14} strokeWidth={2} aria-hidden="true" /> : null}
      {iconOnly ? null : children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  )
}
