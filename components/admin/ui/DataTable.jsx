import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react'

import AdminButton from './AdminButton'
import StatusBadge from './StatusBadge'
import AdminEmptyState from './AdminEmptyState'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

/**
 * Cell renderers, resolved from a column spec's `type`.
 *
 * Kept here rather than in columns.jsx so the specs stay plain data and can be
 * built in a Server Component then handed to the client table.
 *
 * `col.linkKey` names the field to build hrefs from. Database-backed modules
 * route by id while still displaying the slug, so the two cannot be the same
 * field.
 */
const CELLS = {
  strong: (row, col) => <span className="font-medium text-ink">{row[col.key]}</span>,

  mono: (row, col) => <span className="font-mono text-admin-xs text-body">{row[col.key]}</span>,

  status: (row, col) => <StatusBadge status={row[col.key]} />,

  /** Badge whose tone comes from another field on the row (e.g. role colour). */
  badge: (row, col) => <StatusBadge status={row[col.key]} tone={col.toneKey ? row[col.toneKey] : undefined} />,

  money: (row, col) => <span className="font-semibold tabular-nums text-ink">{formatPrice(row[col.key])}</span>,

  number: (row, col) => <span className="tabular-nums">{row[col.key]}</span>,

  seoScore: (row, col) => (
    <StatusBadge
      status={String(row[col.key])}
      tone={row[col.key] >= 85 ? 'success' : row[col.key] >= 70 ? 'warning' : 'danger'}
    />
  ),

  stock: (row, col) => (
    <span className={cn('font-semibold tabular-nums', row[col.key] === 0 ? 'text-danger' : row[col.key] <= 10 ? 'text-[#8A6D1F]' : 'text-ink')}>
      {row[col.key]}
    </span>
  ),

  title: (row, col) => (
    <span className="flex min-w-0 items-center gap-2.5">
      {row[col.imageKey] ? (
        <span className="relative size-9 shrink-0 overflow-hidden rounded-badge border border-border">
          <Image src={row[col.imageKey]} alt="" fill sizes="36px" className="object-cover" />
        </span>
      ) : null}
      <span className="min-w-0">
        {col.hrefBase ? (
          <Link
            href={`${col.hrefBase}/${row[col.linkKey ?? col.slugKey] ?? row.id}`}
            className="block truncate font-semibold text-ink hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
          >
            {row.title ?? row.name}
          </Link>
        ) : (
          <span className="block truncate font-semibold text-ink">{row.title ?? row.name}</span>
        )}
        {row[col.slugKey] !== undefined ? (
          <span className="block truncate font-mono text-admin-xs text-muted">/{row[col.slugKey]}</span>
        ) : null}
      </span>
    </span>
  ),

  actions: (row, col, { onDelete } = {}) => (
    <span className="flex items-center justify-end gap-1">
      {col.viewHrefBase ? (
        <AdminButton href={`${col.viewHrefBase}/${row[col.linkKey] ?? row.slug ?? row.id}`} size="xs" variant="ghost" icon={Eye} iconOnly aria-label={`View ${col.label}`} />
      ) : null}
      {col.editHrefBase ? (
        <AdminButton href={`${col.editHrefBase}/${row[col.linkKey] ?? row.slug ?? row.id}`} size="xs" variant="ghost" icon={Pencil} iconOnly aria-label={`Edit ${col.label}`} />
      ) : null}
      <AdminButton
        size="xs"
        variant="ghost"
        icon={Trash2}
        iconOnly
        aria-label={`Delete ${col.label}`}
        onClick={onDelete ? () => onDelete(row) : undefined}
        className="hover:text-danger"
      />
    </span>
  ),
}

/**
 * The dashboard's only table. Every module list renders through it so column
 * rhythm and empty states never diverge.
 *
 * Scales to thousands of rows because it only ever renders one paginated page.
 * The wrapper owns the horizontal scroll so a wide table never pushes the page
 * sideways on small screens.
 */
export default function DataTable({
  columns,
  rows,
  getRowKey = (row, i) => row.id ?? i,
  selectable = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  sort,
  onSort,
  onDelete,
  empty,
  className,
}) {
  if (!rows?.length) {
    return empty ?? <AdminEmptyState title="Nothing here yet" description="Records will appear once they are created." />
  }

  // Selection is controlled when the caller passes selectedIds, uncontrolled
  // otherwise — so simple lists stay a one-prop opt-in.
  const controlled = Array.isArray(selectedIds)
  const allSelected = controlled && rows.every((r, i) => selectedIds.includes(getRowKey(r, i)))
  const someSelected = controlled && !allSelected && rows.some((r, i) => selectedIds.includes(getRowKey(r, i)))

  const cell = (row, col) => {
    if (col.render) return col.render(row)
    if (col.type && CELLS[col.type]) return CELLS[col.type](row, col, { onDelete })
    return row[col.key]
  }

  return (
    <div className={cn('w-full max-w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {selectable ? (
              <th scope="col" className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                  checked={controlled ? allSelected : undefined}
                  ref={(el) => { if (el && controlled) el.indeterminate = someSelected }}
                  onChange={controlled ? () => onToggleAll?.(!allSelected) : undefined}
                  className="size-3.5 rounded-[3px] accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                />
              </th>
            ) : null}

            {columns.map((col) => {
              const sortable = col.sortable && onSort
              const active = sort?.key === col.key
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'whitespace-nowrap px-3 py-2.5 text-admin-xs font-semibold uppercase tracking-[0.06em] text-muted',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1 uppercase tracking-[0.06em] transition-colors hover:text-ink',
                        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                        active && 'text-ink',
                      )}
                    >
                      {col.header}
                      <ArrowUpDown size={11} className={cn(active ? 'text-gold' : 'text-muted')} aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => {
            const key = getRowKey(row, i)
            const isSelected = controlled && selectedIds.includes(key)
            return (
            <tr
              key={key}
              className={cn(
                'border-b border-border transition-colors last:border-0',
                isSelected ? 'bg-gold/[0.06]' : 'hover:bg-surface-muted/60',
              )}
            >
              {selectable ? (
                <td className="px-3 py-2.5 align-middle">
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.title ?? row.name ?? `row ${i + 1}`}`}
                    checked={controlled ? isSelected : undefined}
                    onChange={controlled ? () => onToggleRow?.(key) : undefined}
                    className="size-3.5 rounded-[3px] accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                  />
                </td>
              ) : null}

              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-3 py-2.5 align-middle text-admin text-body',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className,
                  )}
                >
                  {cell(row, col)}
                </td>
              ))}
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
