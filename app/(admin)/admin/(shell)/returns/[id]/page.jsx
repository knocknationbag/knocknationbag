import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import ReturnStatusForm from '@/components/admin/returns/ReturnStatusForm'
import RefundPanel from '@/components/admin/returns/RefundPanel'
import { getReturn } from '@/lib/db/returns'
import { suggestedRefund } from '@/lib/returns/eligibility'
import { formatAddress } from '@/lib/checkout/validation'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { RETURN_REASONS } from '@/constants/returns'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Return' }

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-admin">
      <dt className="text-body">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  )
}

export default async function AdminReturnPage({ params }) {
  const { id } = await params
  const { ret, error } = await getReturn(id)

  if (error) {
    return (
      <>
        <AdminPageHeader title="Return" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!ret) notFound()

  const order = ret.order
  const refunded = ret.refunds.filter((r) => r.status !== 'failed').reduce((sum, r) => sum + r.amount, 0)
  const address = order?.shippingAddress

  return (
    <>
      <AdminPageHeader
        title={`Return ${ret.number}`}
        description={`Requested ${formatAdminDate(ret.requestedAt)} · ${RETURN_REASONS[ret.reason] ?? ret.reason}`}
        actions={<StatusBadge status={ret.status} />}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <AdminCard title="Items to return" padded={false}>
            <ul>
              {ret.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-badge border border-border bg-surface-muted">
                    {item.image ? <Image src={item.image} alt="" fill sizes="44px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-admin font-semibold text-ink">{item.name}</span>
                    <span className="block text-admin-xs text-muted">{[item.variantLabel, item.sku].filter(Boolean).join(' · ') || '—'}</span>
                  </span>
                  <span className="text-admin tabular-nums text-body">{item.quantity} of {item.orderedQuantity} × {formatPrice(item.unitPrice)}</span>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard title="Customer's reason">
            <p className="text-admin font-semibold text-ink">{RETURN_REASONS[ret.reason] ?? ret.reason}</p>
            {ret.details ? <p className="mt-1 whitespace-pre-line text-admin text-body">{ret.details}</p> : null}
            <p className="mt-2 text-admin-xs text-muted">The customer confirmed the product is unused, unaltered, in its original packaging with tags and invoice.</p>
          </AdminCard>

          <AdminCard title="Timeline">
            <ol className="flex flex-col gap-2.5">
              {ret.events.map((event) => (
                <li key={event.id} className="flex gap-3 text-admin">
                  <span className="w-28 shrink-0 text-admin-xs text-muted">{formatAdminDate(event.at)}</span>
                  <span className="min-w-0">
                    <StatusBadge status={event.status} />
                    {event.isInternal ? <span className="ml-2 text-admin-xs font-semibold text-muted">Internal</span> : null}
                    {event.note ? <span className="mt-1 block whitespace-pre-line text-body">{event.note}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>

        <div className="flex flex-col gap-4">
          <ReturnStatusForm key={ret.status} ret={ret} />
          <RefundPanel key={`${ret.status}-${ret.refunds.length}`} ret={ret}
            suggested={suggestedRefund(ret, refunded)} remaining={Math.max(0, (order?.total ?? 0) - refunded)} />

          {order ? (
            <AdminCard title="Order">
              <dl>
                <Row label="Order" value={<Link href={`/admin/orders/${order.id}`} className="font-semibold hover:text-gold">{order.number}</Link>} />
                <Row label="Delivered" value={formatAdminDate(order.deliveredAt)} />
                <Row label="Payment" value={`${PAYMENT_METHOD_LABELS[order.paymentMethod]} · ${PAYMENT_STATUS_LABELS[order.paymentStatus]}`} />
                <Row label="Order total" value={formatPrice(order.total)} />
                <Row label="Customer" value={order.customerName} />
                <Row label="Phone" value={<a href={`tel:${order.phone}`} className="hover:text-gold">{order.phone}</a>} />
              </dl>
              {address ? <p className="mt-2 border-t border-border pt-2 text-admin-sm text-body">Pickup address: {formatAddress(address)}</p> : null}
            </AdminCard>
          ) : null}
        </div>
      </div>
    </>
  )
}
