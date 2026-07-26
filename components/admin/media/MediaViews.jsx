'use client'

import Image from 'next/image'

import StatusBadge from '@/components/admin/ui/StatusBadge'
import { formatBytes, isMissingAlt, isUnused } from '@/lib/admin/media'
import { cn } from '@/utils/cn'

/** Flags shown on a tile or row — one definition so grid and list agree. */
function Flags({ item, className }) {
  return (
    <span className={cn('flex flex-wrap gap-1', className)}>
      {isMissingAlt(item) ? <StatusBadge status="No alt" tone="danger" /> : null}
      {isUnused(item) ? <StatusBadge status="Unused" tone="warning" /> : null}
    </span>
  )
}

/** Grid view. `selectedIds` renders selection state for the picker. */
export function MediaGrid({ items, onOpen, selectedIds = [], onToggleSelect, selectable = false }) {
  return (
    <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const selected = selectedIds.includes(item.id)
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => (selectable ? onToggleSelect?.(item) : onOpen?.(item))}
              onDoubleClick={() => onOpen?.(item)}
              aria-pressed={selectable ? selected : undefined}
              className={cn(
                'group w-full overflow-hidden rounded-badge border text-left transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                selected ? 'border-ink ring-1 ring-ink' : 'border-border hover:border-border-hover',
              )}
            >
              <span className="relative block aspect-square bg-surface-muted">
                <Image src={item.src} alt="" fill sizes="200px" className="object-cover" />

                <Flags item={item} className="absolute left-1.5 top-1.5" />

                {selectable ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full border text-[10px] font-bold',
                      selected ? 'border-ink bg-ink text-white' : 'border-white/70 bg-surface/80 text-transparent',
                    )}
                  >
                    ✓
                  </span>
                ) : null}
              </span>

              <span className="block border-t border-border px-2 py-1.5">
                <span className="block truncate text-admin-sm font-medium text-ink">{item.filename}</span>
                <span className="block truncate text-admin-xs text-muted">
                  {item.width} × {item.height} · {formatBytes(item.bytes)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** List view — denser, and surfaces alt text and usage at a glance. */
export function MediaList({ items, onOpen, selectedIds = [], onToggleSelect, selectable = false }) {
  return (
    <div className="w-full max-w-full overflow-x-auto">
      <table className="w-max min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {selectable ? <th scope="col" className="w-10 px-3 py-2.5" /> : null}
            {['File', 'Folder', 'Type', 'Dimensions', 'Size', 'Alt text', 'Used in', 'Uploaded'].map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-3 py-2.5 text-admin-xs font-semibold uppercase tracking-[0.06em] text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const selected = selectedIds.includes(item.id)
            return (
              <tr
                key={item.id}
                className={cn('border-b border-border transition-colors last:border-0', selected ? 'bg-gold/[0.06]' : 'hover:bg-surface-muted/60')}
              >
                {selectable ? (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelect?.(item)}
                      aria-label={`Select ${item.filename}`}
                      className="size-3.5 rounded-[3px] accent-[#111827] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                    />
                  </td>
                ) : null}

                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onOpen?.(item)}
                    className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                  >
                    <span className="relative size-8 shrink-0 overflow-hidden rounded-[4px] border border-border">
                      <Image src={item.src} alt="" fill sizes="32px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[220px] truncate text-admin font-medium text-ink">{item.filename}</span>
                      <Flags item={item} className="mt-0.5" />
                    </span>
                  </button>
                </td>

                <td className="px-3 py-2 text-admin capitalize text-body">{item.folder}</td>
                <td className="px-3 py-2 font-mono text-admin-xs text-body">{item.type}</td>
                <td className="whitespace-nowrap px-3 py-2 text-admin tabular-nums text-body">{item.width} × {item.height}</td>
                <td className="whitespace-nowrap px-3 py-2 text-admin tabular-nums text-body">{formatBytes(item.bytes)}</td>
                <td className="px-3 py-2">
                  <span className={cn('block max-w-[240px] truncate text-admin', item.alt ? 'text-body' : 'font-semibold text-danger')}>
                    {item.alt || 'Missing'}
                  </span>
                </td>
                <td className="px-3 py-2 text-admin text-body">
                  {item.usedIn.length ? `${item.usedIn.length} place${item.usedIn.length === 1 ? '' : 's'}` : <span className="text-muted">Nowhere</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-admin text-body">{item.uploaded}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
