import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import OrderStatusForm from '@/components/admin/orders/OrderStatusForm'
import { getOrder } from '@/lib/db/orders'
import { formatAddress } from '@/lib/checkout/validation'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Order' }

function Address({ address }) {
  if (!address) return <p className="text-admin text-muted">Same as delivery address.</p>
  return (
    <div className="text-admin leading-[20px] text-body">
      <p className="font-semibold text-ink">{address.full_name}</p>
      <p>{formatAddress(address)}</p>
      <p>{address.phone}</p>
    </div>
  )
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-admin">
      <dt className={strong ? 'font-semibold text-ink' : 'text-body'}>{label}</dt>
      <dd className={strong ? 'font-bold text-ink' : 'text-ink'}>{value}</dd>
    </div>
  )
}

export default async function AdminOrderPage({ params }) {
  const { id } = await params
  const { order, error } = await getOrder(id)

  if (error) {
    return (
      <>
        <AdminPageHeader title="Order" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!order) notFound()

  const t = order.totals

  return (
    <>
      <AdminPageHeader
        title={`Order ${order.number}`}
        description={`Placed ${formatAdminDate(order.createdAt)} · ${order.itemCount} item${order.itemCount === 1 ? '' : 's'} · ${formatPrice(order.total)}`}
        actions={<div className="flex gap-2"><StatusBadge status={order.status} /><StatusBadge status={PAYMENT_STATUS_LABELS[order.paymentStatus]} /></div>}
      />

      {order.stockIssue ? (
        <AuthMessage tone="error" className="mb-4">
          Paid online, but the stock was no longer available when the payment arrived (or the order was already cancelled).
          Refund the customer in the Razorpay dashboard, or restock and fulfil the order.
        </AuthMessage>
      ) : null}
      {order.awaitingOnlinePayment ? (
        <AuthMessage tone="info" className="mb-4">
          Waiting for online payment. No stock has been reserved. Do not ship until the payment shows as Paid.
        </AuthMessage>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <AdminCard title="Items" padded={false}>
            <ul>
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-badge border border-border bg-surface-muted">
                    {item.image ? <Image src={item.image} alt="" fill sizes="44px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link href={`/admin/products/${item.productId}`} className="block truncate text-admin font-semibold text-ink hover:text-gold">{item.name}</Link>
                    ) : <span className="block truncate text-admin font-semibold text-ink">{item.name}</span>}
                    <span className="block text-admin-xs text-muted">
                      {[item.variantLabel, item.sku, item.isWholesalePrice && 'Wholesale price'].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </span>
                  <span className="text-admin tabular-nums text-body">{item.quantity} × {formatPrice(item.unitPrice)}</span>
                  <span className="w-24 text-right text-admin font-semibold tabular-nums text-ink">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="border-t border-border px-4 py-3">
              <Row label="Subtotal" value={formatPrice(t.subtotal)} />
              <Row label="Shipping" value={t.shippingFee ? formatPrice(t.shippingFee) : 'Free'} />
              {t.gstRate ? <Row label={`GST ${t.gstRate}%${t.pricesIncludeGst ? ' (included)' : ''}`} value={formatPrice(t.gstAmount)} /> : null}
              <Row label="Total" value={formatPrice(t.total)} strong />
            </dl>
          </AdminCard>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminCard title="Delivery address"><Address address={order.shippingAddress} /></AdminCard>
            <AdminCard title="Billing address"><Address address={order.billingAddress} /></AdminCard>
          </div>

          {order.note ? (
            <AdminCard title="Customer note">
              <p className="whitespace-pre-line text-admin text-body">{order.note}</p>
            </AdminCard>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <OrderStatusForm order={order} />

          <AdminCard title="Customer">
            <dl>
              <Row label="Name" value={order.customerName} />
              <Row label="Email" value={<a href={`mailto:${order.email}`} className="hover:text-gold">{order.email}</a>} />
              <Row label="Phone" value={<a href={`tel:${order.phone}`} className="hover:text-gold">{order.phone}</a>} />
              <Row label="Account" value={order.userId ? <Link href={`/admin/customers/${order.userId}`} className="font-semibold hover:text-gold">View customer</Link> : 'Guest checkout'} />
              {order.isWholesale ? <Row label="Pricing" value="Wholesale" /> : null}
            </dl>
          </AdminCard>

          <AdminCard title="Payment">
            <dl>
              <Row label="Method" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
              <Row label="Status" value={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
              {order.paidAt ? <Row label="Paid" value={formatAdminDate(order.paidAt)} /> : null}
              {order.razorpayPaymentId ? <Row label="Razorpay ID" value={<span className="font-mono text-admin-xs">{order.razorpayPaymentId}</span>} /> : null}
            </dl>
            {order.paymentStatus === 'cod_pending' && order.status !== 'Cancelled' ? (
              <p className="mt-2 text-admin-sm text-muted">Collect {formatPrice(order.total)} in cash on delivery. Marking the order Delivered records it as paid.</p>
            ) : null}
          </AdminCard>

          <AdminCard title="Timeline">
            <dl>
              <Row label="Placed" value={formatAdminDate(order.createdAt)} />
              {order.shippedAt ? <Row label="Shipped" value={formatAdminDate(order.shippedAt)} /> : null}
              {order.deliveredAt ? <Row label="Delivered" value={formatAdminDate(order.deliveredAt)} /> : null}
              {order.cancelledAt ? <Row label="Cancelled" value={formatAdminDate(order.cancelledAt)} /> : null}
            </dl>
          </AdminCard>
        </div>
      </div>
    </>
  )
}
