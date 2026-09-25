import Image from 'next/image'
import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import OrderSummary from '@/components/common/OrderSummary'
import PayNowButton from '@/components/checkout/PayNowButton'
import { ORDER_STATUS_HELP, ORDER_STATUS_TONE, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { formatAddress } from '@/lib/checkout/validation'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate } from '@/utils/formatDate'

function Block({ title, children }) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 xl:p-6">
      <h2 className="font-mono text-eyebrow uppercase text-gold">{title}</h2>
      <div className="mt-3 text-[15px] leading-[24px] text-body">{children}</div>
    </section>
  )
}

/**
 * A placed order as the customer sees it — used by the confirmation page and
 * the account order page, so both always show the same thing.
 */
export default function OrderDetails({ order }) {
  const address = order.shippingAddress ?? {}

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={order.awaitingOnlinePayment ? 'neutral' : ORDER_STATUS_TONE[order.status] ?? 'neutral'}>
            {order.awaitingOnlinePayment ? 'Awaiting payment' : order.status}
          </Badge>
          <p className="text-[15px] text-body">{order.awaitingOnlinePayment ? 'Pay to confirm your order.' : ORDER_STATUS_HELP[order.status]}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Block title="Delivery address">
            <p className="font-semibold text-ink">{address.full_name}</p>
            <p>{formatAddress(address)}</p>
            <p>{address.phone}</p>
          </Block>
          <Block title="Payment">
            <p className="font-semibold text-ink">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            <p>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
            {order.paymentMethod === 'cod' && order.paymentStatus === 'cod_pending' && order.status !== 'Cancelled' ? (
              <p className="mt-1">Please keep {formatPrice(order.total)} ready for the courier.</p>
            ) : null}
            {order.awaitingOnlinePayment ? (
              <div className="mt-3">
                <PayNowButton accessToken={order.accessToken} total={order.total} />
              </div>
            ) : null}
          </Block>
          {order.trackingNumber ? (
            <Block title="Shipment">
              <p className="font-semibold text-ink">{order.courier || 'Courier'}</p>
              <p>Tracking number: <span className="font-mono text-ink">{order.trackingNumber}</span></p>
            </Block>
          ) : null}
          <Block title="Contact">
            <p>{order.email}</p>
            <p>Placed {formatAdminDate(order.createdAt)}</p>
          </Block>
        </div>

        <section aria-labelledby="order-items">
          <h2 id="order-items" className="text-[18px] font-bold text-ink">Items</h2>
          <ul className="mt-4 divide-y divide-border rounded-card border border-border bg-surface px-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-media border border-border bg-surface-muted">
                  {item.image ? <Image src={item.image} alt="" fill sizes="64px" className="object-cover" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  {item.slug ? (
                    <Link href={`/product/${item.slug}`} className="block truncate text-[15px] font-semibold text-ink hover:text-gold">{item.name}</Link>
                  ) : <span className="block truncate text-[15px] font-semibold text-ink">{item.name}</span>}
                  <span className="block text-[13px] text-body">
                    {[item.variantLabel, `Qty ${item.quantity}`, `${formatPrice(item.unitPrice)} each`, item.isWholesalePrice && 'Wholesale price'].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="text-[15px] font-bold text-ink">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {order.note ? (
          <Block title="Your note">
            <p className="whitespace-pre-line">{order.note}</p>
          </Block>
        ) : null}
      </div>

      <OrderSummary totals={order.totals} title="Order total" className="h-fit" />
    </div>
  )
}
