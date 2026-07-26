import ProductCard from './ProductCard'
import { cn } from '@/utils/cn'

/**
 * The canonical responsive product grid, declared once so no section repeats it.
 * docs/responsive.md §4.4 — 2 cols mobile, 3 tablet, 4 (or 3) desktop.
 * Every product renders at every breakpoint; rows wrap rather than truncate.
 */
const COLUMNS = {
  2: 'grid-cols-2 md:grid-cols-2 xl:grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
}

const SIZES = {
  2: '(max-width: 767px) 50vw, 50vw',
  3: '(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 33vw',
  4: '(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw',
}

export default function ProductGrid({ products, columns = 4, priorityCount = 0, className }) {
  return (
    <ul className={cn('grid gap-3 md:gap-4 xl:gap-6', COLUMNS[columns], className)}>
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard
            {...product}
            sizes={SIZES[columns]}
            priority={index < priorityCount}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  )
}
