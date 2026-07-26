import Link from 'next/link'
import Image from 'next/image'
import {
  BadgeCheck, DollarSign, Gauge, Percent, Plus, Search, ShoppingCart, TrendingUp,
} from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import StatCard from '@/components/admin/ui/StatCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import DataTable from '@/components/admin/ui/DataTable'
import { adminProducts, kpis, recentOrders, seoKpis } from '@/data/admin'
import { formatPrice } from '@/utils/formatPrice'

export const metadata = { title: 'Dashboard' }

const KPI_ICONS = { revenue: DollarSign, orders: ShoppingCart, aov: TrendingUp, conversion: Percent }

/** Sparkline drawn as an inline SVG polyline — no chart dependency. */
function Sparkline({ points, className }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / range) * 26}`)
    .join(' ')

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={className} aria-hidden="true">
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const WEEKLY_REVENUE = [18, 24, 21, 32, 28, 39, 35, 44, 41, 52, 48, 61]

export default function AdminDashboardPage() {
  const needsSeo = [...adminProducts].sort((a, b) => a.seoScore - b.seoScore).slice(0, 5)

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Trading overview for the last 30 days, and anything that needs attention."
        actions={
          <>
            <AdminButton href="/admin/analytics" size="sm" icon={Gauge}>Analytics</AdminButton>
            <AdminButton href="/admin/products/new" variant="primary" size="sm" icon={Plus}>New product</AdminButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} icon={KPI_ICONS[kpi.icon]} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminCard
          title="Revenue trend"
          description="Rolling 12 weeks"
          actions={<AdminButton href="/admin/analytics" size="xs" variant="ghost">View report</AdminButton>}
        >
          <div className="flex items-end gap-1.5">
            {WEEKLY_REVENUE.map((v, i) => (
              <div key={i} className="flex-1">
                <div
                  className="rounded-t-[3px] bg-ink/85 transition-colors hover:bg-gold"
                  style={{ height: `${(v / Math.max(...WEEKLY_REVENUE)) * 120}px` }}
                  title={`Week ${i + 1}: $${v}k`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-admin-xs text-muted">
            <span>12 weeks ago</span>
            <span className="inline-flex items-center gap-1 text-verified-fg">
              <TrendingUp size={12} aria-hidden="true" /> +18% quarter on quarter
            </span>
            <span>This week</span>
          </div>
        </AdminCard>

        <AdminCard
          title="SEO health"
          description="Highest priority — checked on every save"
          actions={<AdminButton href="/admin/seo" size="xs" variant="ghost" icon={Search}>SEO</AdminButton>}
        >
          <ul className="flex flex-col gap-2.5">
            {seoKpis.map((k) => (
              <li key={k.label} className="flex items-baseline justify-between gap-3">
                <span className="text-admin text-body">{k.label}</span>
                <span className="text-right">
                  <span className="text-admin-md font-bold text-ink">{k.value}</span>
                  <span className="ml-1.5 text-admin-xs text-muted">{k.hint}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center gap-2 rounded-badge border border-border bg-surface-muted px-2.5 py-2">
            <Sparkline points={[62, 66, 71, 69, 74, 78, 80, 82]} className="h-7 w-16 text-verified-fg" />
            <p className="text-admin-xs text-body">Average score improving — 82 this week</p>
          </div>
        </AdminCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <AdminCard
          title="Recent orders"
          padded={false}
          actions={<AdminButton href="/admin/orders" size="xs" variant="ghost">All orders</AdminButton>}
        >
          <DataTable
            rows={recentOrders.slice(0, 6)}
            columns={[
              {
                key: 'id', header: 'Order',
                render: (r) => (
                  <Link href="/admin/orders" className="font-mono text-admin-sm font-semibold text-ink hover:text-gold">
                    {r.id}
                  </Link>
                ),
              },
              {
                key: 'customer', header: 'Customer',
                render: (r) => (
                  <span className="block min-w-0">
                    <span className="block truncate font-medium text-ink">{r.customer}</span>
                    <span className="block truncate text-admin-xs text-muted">{r.email}</span>
                  </span>
                ),
              },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'total', header: 'Total', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-ink">{formatPrice(r.total)}</span> },
            ]}
          />
        </AdminCard>

        <AdminCard
          title="Lowest SEO scores"
          description="Fix these before publishing anything new"
          padded={false}
          actions={<AdminButton href="/admin/products" size="xs" variant="ghost">Products</AdminButton>}
        >
          <ul className="divide-y divide-border">
            {needsSeo.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-badge border border-border">
                  <Image src={p.image} alt="" fill sizes="32px" className="object-cover" />
                </span>
                <Link href={`/admin/products/${p.slug}`} className="min-w-0 flex-1 truncate text-admin font-medium text-ink hover:text-gold">
                  {p.title}
                </Link>
                <StatusBadge
                  status={String(p.seoScore)}
                  tone={p.seoScore >= 85 ? 'success' : p.seoScore >= 70 ? 'warning' : 'danger'}
                />
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <AdminCard title="Quick actions" className="mt-4">
        <div className="flex flex-wrap gap-2">
          <AdminButton href="/admin/products/new" size="sm" icon={Plus}>Add product</AdminButton>
          <AdminButton href="/admin/categories" size="sm" icon={Plus}>Add category</AdminButton>
          <AdminButton href="/admin/pages" size="sm" icon={Plus}>New CMS page</AdminButton>
          <AdminButton href="/admin/blog" size="sm" icon={Plus}>Write a post</AdminButton>
          <AdminButton href="/admin/redirects" size="sm" icon={Plus}>Add redirect</AdminButton>
          <AdminButton href="/admin/media" size="sm" icon={BadgeCheck}>Review unused media</AdminButton>
        </div>
      </AdminCard>
    </>
  )
}
