import { cn } from '@/utils/cn'

/**
 * Horizontal rhythm for the whole site. docs/design.md §6.1.
 * Yields 358 / 928 / 1760px content widths at 390 / 1024 / 1920 — matching all three mockups.
 */
export default function Container({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag
      className={cn('mx-auto w-full max-w-[1920px] px-4 md:px-12 xl:px-20', className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
