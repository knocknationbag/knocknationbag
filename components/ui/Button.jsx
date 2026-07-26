import Link from 'next/link'

import { cn } from '@/utils/cn'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'whitespace-nowrap transition duration-150 ease-out ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ' +
  'disabled:pointer-events-none disabled:opacity-50'

const VARIANTS = {
  primary: 'bg-gold text-ink hover:brightness-95',
  secondary: 'border-2 border-ink text-ink hover:bg-ink hover:text-white',
  dark: 'bg-ink text-white hover:bg-ink/90',
  ghost: 'text-ink hover:text-gold',
}

const SIZES = {
  sm: 'h-8 px-4 text-btn-sm xl:px-5',
  md: 'h-[50px] px-8 text-btn',
  lg: 'h-13 px-8 text-btn',
}

/**
 * The only button in the codebase. docs/design.md §10.1.
 * Renders next/link when `href` is set, otherwise a native <button>.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  children,
  type = 'button',
  ...props
}) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)

  const content = (
    <>
      {Icon && iconPosition === 'left' ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
      {Icon && iconPosition === 'right' ? <Icon size={18} aria-hidden="true" /> : null}
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
