'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'

import { recordOrderPrint } from '@/lib/actions/orders'
import { cn } from '@/utils/cn'

const BUTTON =
  'inline-flex h-9 items-center gap-1.5 rounded-badge px-3 text-admin font-semibold transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50'

/**
 * Screen-only controls above a printable document (hidden when printing).
 * For the team, `record` = { orderId, kind } counts the print so the order
 * page can say "Reprint"; customers print without anything being recorded.
 */
export default function PrintToolbar({ backHref, backLabel = 'Back', record = null, printCount = 0, lastPrinted = null, className }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function print() {
    startTransition(async () => {
      if (record) await recordOrderPrint(record.orderId, record.kind)
      window.print()
      if (record) router.refresh()
    })
  }

  return (
    <div className={cn('mx-auto flex w-full max-w-[794px] flex-wrap items-center justify-between gap-3 px-4 py-4 print:hidden', className)}>
      <Link href={backHref} className={cn(BUTTON, 'text-body hover:text-ink')}>
        <ArrowLeft size={14} aria-hidden="true" /> {backLabel}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        {record && printCount > 0 ? (
          <span className="text-admin-sm text-muted">Printed {printCount}×{lastPrinted ? ` · last ${lastPrinted}` : ''}</span>
        ) : null}
        <button type="button" onClick={print} disabled={pending} className={cn(BUTTON, 'bg-ink text-white hover:bg-ink/90')}>
          <Printer size={14} aria-hidden="true" /> {record && printCount > 0 ? 'Reprint' : 'Print'}
        </button>
      </div>
    </div>
  )
}
