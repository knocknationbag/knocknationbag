import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, Clock, IndianRupee, Package, PackageX, Plus, ShoppingCart, Users } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import StatCard from '@/components/admin/ui/StatCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { listProducts, productStats } from '@/lib/db/products'
import { customerStats } from '@/lib/db/profiles'
import { listOrders, orderStats } from '@/lib/db/orders'
import { PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Dashboard' }

const show = (value) => (value === null || value === undefined ? '—' : value.toLocaleString('en-IN'))

/**
 * The owner's first screen: what came in, what needs doing, what is running
 * out. Every number is live from the database. "Sales" counts every order
 * that is not cancelled, including Cash on Delivery orders not yet collected.
 */
export default async function DashboardPage() {
  const [products, customers, orders, recent, attention] = await Promise.all([
    productStats(),
    customerStats(),
    orderStats(),
    listOrders({ pageSize: 6 }),
    listProducts({ stock: 'attention', order: 'stock', pageSize: 8 }),
  ])

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Your shop at a glance."
        actions={
          <div className="flex gap-2">
            <AdminButton href="/admin/categories/new" size="sm" icon={Plus}>Category</AdminButton>
            <AdminButton href="/admin/products/new" variant="primary" size="sm" icon={Plus}>Product</AdminButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={show(orders?.totalOrders)} icon={ShoppingCart}
          hint={orders ? `${orders.todayOrders} today` : undefined} />
        <StatCard label="Total sales" value={orders ? formatPrice(orders.totalSales) : '—'} icon={IndianRupee}
          hint={orders ? `${formatPrice(orders.todaySales)} today` : undefined} />
        <StatCard label="Pending orders" value={show(orders?.pendingOrders)} icon={Clock}
          hint={orders ? `${orders.toShip} to ship${orders.awaitingPayment ? ` · ${orders.awaitingPayment} awaiting online payment` : ''}` : undefined} />
        <StatCard label="Customers" value={show(customers.total)} icon={Users}
          hint={customers.wholesale ? `${customers.wholesale} approved wholesale` : 'No wholesale approvals yet'} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Products in the shop" value={show(products.published)} icon={Package}
          hint={products.drafts ? `${products.drafts} draft${products.drafts === 1 ? '' : 's'} not yet published` : 'All published'} />
        <StatCard label="Low stock" value={show(products.low)} icon={AlertTriangle} hint="At or below alert level" />
        <StatCard label="Out of stock" value={show(products.out)} icon={PackageX} hint="Cannot be bought" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <AdminCard
          title="Recent orders"
          padded={false}
          actions={<AdminButton href="/admin/orders" size="xs">All orders</AdminButton>}
        >
          {recent.rows.length === 0 ? (
            <AdminEmptyState icon={ShoppingCart} title="No orders yet" description="New orders appear here as soon as they are placed." />
          ) : (
            <ul>
              {recent.rows.map((o) => (
                <li key={o.id} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0">
                  <Link href={`/admin/orders/${o.id}`} className="w-24 shrink-0 text-admin font-semibold text-ink hover:text-gold">{o.number}</Link>
                  <span className="min-w-0 flex-1 truncate text-admin text-body">{o.customerName} · {formatAdminDate(o.createdAt)}</span>
                  <span className="text-admin font-semibold tabular-nums text-ink">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                  <span className="hidden sm:inline"><StatusBadge status={PAYMENT_STATUS_LABELS[o.paymentStatus]} /></span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard
          title="Needs attention"
          description="Products that are low or out of stock."
          padded={false}
          actions={<AdminButton href="/admin/inventory" size="xs">Open inventory</AdminButton>}
        >
          {attention.rows.length === 0 ? (
            <AdminEmptyState title="All stocked up" description="No product is at or below its low-stock alert." />
          ) : (
            <ul>
              {attention.rows.map((p) => (
                <li key={p.id} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0">
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-badge border border-border bg-surface-muted">
                    {p.featuredImage ? <Image src={p.featuredImage} alt="" fill sizes="36px" className="object-cover" /> : null}
                  </span>
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 truncate text-admin font-semibold text-ink hover:text-gold">
                    {p.name}
                  </Link>
                  <span className="text-admin-sm tabular-nums text-body">{p.stock} left</span>
                  <StatusBadge status={p.stockStatus} />
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  )
}
