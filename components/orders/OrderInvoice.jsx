import Image from 'next/image'

import { store } from '@/constants/site'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { formatPrice } from '@/utils/formatPrice'
import { formatIndiaDate } from '@/utils/indiaDate'
import { cn } from '@/utils/cn'

function Party({ title, address, email, phone }) {
  if (!address) return null
  return (
    <div>
      <p className="font-mono text-admin-xs uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-1 text-admin-md font-semibold text-ink">{address.full_name}</p>
      <p className="text-admin text-body">
        {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
        {address.city}, {address.state} {address.pincode}<br />
        {address.country ?? 'India'}
      </p>
      <p className="mt-1 text-admin text-body">{[phone ?? address.phone, email].filter(Boolean).join(' · ')}</p>
    </div>
  )
}

function Total({ label, value, strong = false }) {
  return (
    <div className={cn('flex justify-between gap-6 py-1 text-admin', strong ? 'border-t border-ink pt-2 font-bold text-ink' : 'text-body')}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * The customer bill, rendered straight from the order — its items are the
 * price snapshot taken when it was placed, so reprinting months later shows
 * exactly what was charged. No billing data is stored separately.
 */
export default function OrderInvoice({ order }) {
  const t = order.totals
  const collect = order.paymentMethod === 'cod' && order.paymentStatus === 'cod_pending'
  const gstLabel = t.gstRate ? `GST ${t.gstRate}%${t.pricesIncludeGst ? ' (included in prices)' : ''}` : null

  return (
    <article className="mx-auto w-full max-w-[794px] bg-surface p-6 text-body md:p-10 print:max-w-none print:p-0 [page:bill]">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
        <div>
          <Image src="/logo/header-footer-logo/header.svg" alt={store.name} width={142} height={48} priority />
          <p className="mt-3 max-w-[340px] text-admin-sm text-body">{store.address}</p>
          <p className="text-admin-sm text-body">{store.email}</p>
        </div>
        <div className="text-right">
          <h1 className="text-admin-h1 font-extrabold text-ink">Bill</h1>
          <dl className="mt-2 text-admin">
            <div className="flex justify-end gap-3"><dt className="text-muted">Bill / Order no.</dt><dd className="font-mono font-semibold text-ink">{order.number}</dd></div>
            <div className="flex justify-end gap-3"><dt className="text-muted">Date</dt><dd className="text-ink">{formatIndiaDate(order.createdAt)}</dd></div>
            <div className="flex justify-end gap-3"><dt className="text-muted">Payment</dt><dd className="text-ink">{PAYMENT_METHOD_LABELS[order.paymentMethod]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}</dd></div>
          </dl>
        </div>
      </header>

      <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
        <Party title="Bill to" address={order.billingAddress ?? order.shippingAddress} email={order.email} phone={order.billingAddress ? undefined : order.phone} />
        <Party title="Ship to" address={order.shippingAddress} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-admin">
          <thead>
            <tr className="border-b border-ink text-admin-xs uppercase tracking-wider text-muted">
              <th scope="col" className="py-2 pr-3 font-semibold">#</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Product</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Unit price</th>
              <th scope="col" className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id} className="border-b border-border align-top">
                <td className="py-2.5 pr-3 tabular-nums">{index + 1}</td>
                <td className="py-2.5 pr-3">
                  <span className="font-semibold text-ink">{item.name}</span>
                  <span className="block text-admin-xs text-muted">{[item.variantLabel, item.sku && `SKU ${item.sku}`, item.isWholesalePrice && 'Wholesale price'].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{item.quantity}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{formatPrice(item.unitPrice)}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums text-ink">{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <dl className="w-full max-w-[320px]">
          <Total label="Subtotal" value={formatPrice(t.subtotal)} />
          {t.discount > 0 ? <Total label={`Coupon${t.couponCode ? ` ${t.couponCode}` : ''}`} value={`−${formatPrice(t.discount)}`} /> : null}
          <Total label="Shipping" value={t.shippingFee ? formatPrice(t.shippingFee) : 'Free'} />
          {t.shippingDiscount > 0 ? <Total label="Shipping waived" value={`−${formatPrice(t.shippingDiscount)}`} /> : null}
          {gstLabel ? <Total label={gstLabel} value={formatPrice(t.gstAmount)} /> : null}
          <Total label={collect ? 'Amount to pay on delivery' : 'Total'} value={formatPrice(t.total)} strong />
        </dl>
      </div>

      <footer className="mt-8 border-t border-border pt-4 text-admin-xs text-muted">
        <p>Every product has different warranty rules depending on the category and specifications.</p>
        <p className="mt-1">Returns: request from your order page within 7 days of delivery. Keep this bill — it must accompany any return.</p>
        <p className="mt-1">This is a computer-generated bill for order {order.number}.</p>
      </footer>
    </article>
  )
}
