import { cn } from '@/utils/cn'

/**
 * The eyebrow + heading pair that opens almost every section.
 * docs/design.md §5.1 — eyebrow to title 16px, title to content 40px.
 * Mobile forces left alignment per the reference; tablet and desktop centre.
 */
export default function SectionHeader({
  eyebrow,
  title,
  as: Tag = 'h2',
  align = 'center',
  className,
}) {
  return (
    <div
      className={cn(
        'mb-6 md:mb-8 xl:mb-10',
        align === 'center' ? 'text-left md:text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-eyebrow uppercase text-gold">{eyebrow}</p>
      ) : null}

      <Tag
        className={cn(
          'font-extrabold text-ink',
          'text-h2 md:text-h2-md xl:text-h2-xl',
          eyebrow && 'mt-3 md:mt-3.5 xl:mt-4',
        )}
      >
        {title}
      </Tag>
    </div>
  )
}
