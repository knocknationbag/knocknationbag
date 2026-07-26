import Badge from '@/components/ui/Badge'
import Rating from '@/components/product/Rating'
import { cn } from '@/utils/cn'

/**
 * docs/design.md §10.5. Semantic figure/blockquote/figcaption so the quote and
 * its attribution are programmatically associated.
 */
export default function ReviewCard({ quote, name, role, rating, isVerified = false, className }) {
  return (
    <figure
      className={cn(
        'flex h-full flex-col rounded-card border border-border bg-surface-muted p-6 xl:p-8',
        className,
      )}
    >
      <Rating value={rating} showValue={false} size={16} />

      <blockquote className="mt-5 text-[16px] leading-[24px] text-body xl:mt-6">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[16px] font-bold text-ink">{name}</span>
          {isVerified ? <Badge variant="verified">Verified</Badge> : null}
        </div>
        <p className="mt-1.5 text-[14px] leading-[21px] text-body">{role}</p>
      </figcaption>
    </figure>
  )
}
