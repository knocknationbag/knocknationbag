import { store } from '@/constants/site'
import { formatPrice } from '@/utils/formatPrice'
import { formatIndiaDate } from '@/utils/indiaDate'

/**
 * 3 × 5 inch shipping label (portrait), sized in physical units so it prints
 * true on label stock: the element is exactly the page, and [page:label]
 * selects the 3in × 5in @page from globals.css. On screen it is shown as a
 * bordered card of the same size.
 *
 * Holds what a courier needs: recipient, phone, order number, whether cash
 * must be collected, item count, courier/tracking when known, and the sender.
 */
export default function ShippingLabel({ order }) {
  const to = order.shippingAddress ?? {}
  const cod = order.paymentMethod === 'cod' && order.paymentStatus === 'cod_pending'

  return (
    <article className="mx-auto flex h-[5in] w-[3in] flex-col overflow-hidden border border-ink bg-surface p-[0.15in] text-ink print:border-0 [page:label]">
      <div className="flex items-start justify-between gap-2 border-b-2 border-ink pb-1.5">
        <div className="min-w-0">
          <p className="font-mono text-admin-xs uppercase tracking-wider">Order</p>
          <p className="font-mono text-admin-title font-bold leading-none">{order.number}</p>
        </div>
        <div className="text-right">
          <p className="rounded-badge bg-ink px-1.5 py-0.5 text-admin-sm font-extrabold uppercase text-white">{cod ? 'COD' : 'Prepaid'}</p>
          <p className="mt-0.5 text-admin-xs">{formatIndiaDate(order.createdAt)}</p>
        </div>
      </div>

      {cod ? (
        <p className="mt-1.5 border-2 border-ink px-1.5 py-1 text-center text-admin-md font-extrabold">
          Collect {formatPrice(order.total)}
        </p>
      ) : null}

      <div className="mt-2 flex-1">
        <p className="font-mono text-admin-xs uppercase tracking-wider">Deliver to</p>
        <p className="mt-0.5 text-admin-lg font-bold leading-tight">{to.full_name}</p>
        <p className="mt-1 text-admin-md leading-snug">
          {to.line1}{to.line2 ? `, ${to.line2}` : ''}<br />
          {to.city}, {to.state}
        </p>
        <p className="mt-1 font-mono text-admin-title font-bold">{to.pincode}</p>
        <p className="mt-1 text-admin-md font-semibold">Ph: {to.phone ?? order.phone}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-2 border-y border-ink py-1 text-admin-xs">
        <div><dt className="inline font-semibold">Items: </dt><dd className="inline">{order.itemCount}</dd></div>
        <div><dt className="inline font-semibold">Courier: </dt><dd className="inline">{order.courier || '—'}</dd></div>
        <div className="col-span-2"><dt className="inline font-semibold">Tracking: </dt><dd className="inline font-mono">{order.trackingNumber || '—'}</dd></div>
      </dl>

      <div className="pt-1.5 text-admin-xs leading-tight">
        <p className="font-mono uppercase tracking-wider">From</p>
        <p className="font-semibold">{store.name}</p>
        <p>{store.address}</p>
        <p>{store.email}</p>
      </div>
    </article>
  )
}
