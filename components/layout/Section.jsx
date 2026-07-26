import Container from './Container'
import { cn } from '@/utils/cn'

const BACKGROUNDS = {
  surface: 'bg-surface',
  muted: 'bg-surface-muted',
}

/**
 * Vertical rhythm + background band. docs/design.md §5.1 / §6.4.
 * `bleed` skips the Container for full-width sections (PromoBanner, Instagram).
 * `divided` draws the hairline that separates Featured Collection from Brand Promise.
 */
export default function Section({
  background = 'surface',
  divided = false,
  bleed = false,
  className,
  innerClassName,
  children,
  ...props
}) {
  const content = bleed ? children : <Container className={innerClassName}>{children}</Container>

  return (
    <section
      className={cn(
        'py-12 md:py-18 xl:py-25',
        BACKGROUNDS[background],
        divided && 'border-t border-border',
        className,
      )}
      {...props}
    >
      {content}
    </section>
  )
}
