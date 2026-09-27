import Link from 'next/link'
import { FileText, Tag } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { formatAdminDate } from '@/utils/formatDate'

/**
 * Bill and 3 × 5 shipping label for an order, plus any returns raised on it.
 * "Reprint" once a document has been printed, with when it last was.
 */
export default function OrderDocumentsCard({ order, returns = [] }) {
  const printed = (count, at) => (count ? `Printed ${count}× · last ${formatAdminDate(at)}` : 'Not printed yet')

  return (
    <AdminCard title="Documents & returns">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 text-admin-xs text-muted">{printed(order.invoicePrintCount, order.invoicePrintedAt)}</span>
          <AdminButton href={`/admin/orders/${order.id}/invoice`} size="sm" icon={FileText}>
            {order.invoicePrintCount ? 'Reprint bill' : 'Print bill'}
          </AdminButton>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 text-admin-xs text-muted">{printed(order.labelPrintCount, order.labelPrintedAt)}</span>
          <AdminButton href={`/admin/orders/${order.id}/label`} size="sm" icon={Tag}>
            {order.labelPrintCount ? 'Reprint label' : 'Print 3×5 label'}
          </AdminButton>
        </div>

        {returns.length ? (
          <ul className="flex flex-col gap-2 border-t border-border pt-3">
            {returns.map((ret) => (
              <li key={ret.id} className="flex items-center justify-between gap-3 text-admin">
                <Link href={`/admin/returns/${ret.id}`} className="font-semibold text-ink hover:text-gold">{ret.number}</Link>
                <StatusBadge status={ret.status} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </AdminCard>
  )
}
