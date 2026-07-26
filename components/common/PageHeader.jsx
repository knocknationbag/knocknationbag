import Container from '@/components/layout/Container'
import Breadcrumb from './Breadcrumb'
import { cn } from '@/utils/cn'

/**
 * The standard page opener: breadcrumbs, eyebrow, H1 and optional lead.
 * Every non-home page uses this so the rhythm never drifts.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  align = 'left',
  children,
  className,
}) {
  return (
    <section className={cn('border-b border-border bg-surface-muted py-8 md:py-10 xl:py-12', className)}>
      <Container>
        {breadcrumbs.length ? <Breadcrumb items={breadcrumbs} className="mb-5" /> : null}

        <div className={cn(align === 'center' && 'text-center')}>
          {eyebrow ? (
            <p className="font-mono text-eyebrow uppercase text-gold">{eyebrow}</p>
          ) : null}

          <h1
            className={cn(
              'font-extrabold text-ink text-h2 md:text-h2-md xl:text-h2-xl',
              eyebrow && 'mt-3',
            )}
          >
            {title}
          </h1>

          {description ? (
            <p
              className={cn(
                'mt-4 max-w-[680px] text-lead text-body md:text-lead-md',
                align === 'center' && 'mx-auto',
              )}
            >
              {description}
            </p>
          ) : null}

          {children}
        </div>
      </Container>
    </section>
  )
}
