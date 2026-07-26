import { cn } from '@/utils/cn'

/**
 * Loading placeholder. The pulse is suppressed under prefers-reduced-motion by
 * the global override in globals.css.
 */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-media bg-border/70', className)} aria-hidden="true" />
}

/** Matches ProductCard's footprint so a loading grid does not shift on hydrate. */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface p-3 xl:p-4">
      <Skeleton className="h-40 w-full md:h-[220px] xl:h-[280px]" />
      <Skeleton className="mt-4 h-3.5 w-24 xl:mt-6" />
      <Skeleton className="mt-3 h-4 w-3/4 xl:mt-4" />
      <div className="mt-3 flex items-center justify-between gap-3 xl:mt-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
