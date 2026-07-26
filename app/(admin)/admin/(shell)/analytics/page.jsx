import { DollarSign, Percent, ShoppingCart, TrendingUp, Users } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import StatCard from '@/components/admin/ui/StatCard'
import DataTable from '@/components/admin/ui/DataTable'
import { adminProducts, kpis } from '@/data/admin'
import { formatPrice } from '@/utils/formatPrice'

export const metadata = { title: 'Analytics' }

const ICONS = { revenue: DollarSign, orders: ShoppingCart, aov: TrendingUp, conversion: Percent }

const CHANNELS = [
  { name: 'Organic search', sessions: 18420, share: 42, orders: 138 },
  { name: 'Direct', sessions: 9110, share: 21, orders: 74 },
  { name: 'Paid social', sessions: 7340, share: 17, orders: 52 },
  { name: 'Email', sessions: 5290, share: 12, orders: 46 },
  { name: 'Referral', sessions: 3480, share: 8, orders: 17 },
]

const TOP_PAGES = [
  { path: '/', views: 24810, entries: 18240, bounce: '38%' },
  { path: '/shop', views: 12430, entries: 4120, bounce: '31%' },
  { path: '/product/apex-duffle-pro', views: 8940, entries: 3010, bounce: '44%' },
  { path: '/category/travel', views: 6120, entries: 1880, bounce: '36%' },
  { path: '/collections/best-sellers', views: 5410, entries: 1240, bounce: '29%' },
]

export default function AdminAnalyticsPage() {
  const topProducts = [...adminProducts].sort((a, b) => b.price - a.price).slice(0, 6)

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Traffic, conversion and product performance for the last 30 days."
        actions={
          <>
            <AdminButton size="sm">Last 30 days</AdminButton>
            <AdminButton size="sm" variant="secondary">Export</AdminButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <StatCard key={k.label} {...k} icon={ICONS[k.icon]} />)}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <AdminCard title="Acquisition channels" description="Sessions and orders by source">
          <ul className="flex flex-col gap-3">
            {CHANNELS.map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-admin font-medium text-ink">{c.name}</span>
                  <span className="text-admin-sm tabular-nums text-body">
                    {c.sessions.toLocaleString('en-US')} sessions · {c.orders} orders
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${c.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Top pages" padded={false}>
          <DataTable
            rows={TOP_PAGES}
            getRowKey={(r) => r.path}
            columns={[
              { key: 'path', header: 'Path', render: (r) => <span className="font-mono text-admin-sm text-ink">{r.path}</span> },
              { key: 'views', header: 'Views', align: 'right', render: (r) => <span className="tabular-nums">{r.views.toLocaleString('en-US')}</span> },
              { key: 'entries', header: 'Entries', align: 'right', render: (r) => <span className="tabular-nums">{r.entries.toLocaleString('en-US')}</span> },
              { key: 'bounce', header: 'Bounce', align: 'right' },
            ]}
          />
        </AdminCard>
      </div>

      <AdminCard title="Product performance" description="Highest revenue contribution" padded={false} className="mt-4">
        <DataTable
          rows={topProducts}
          columns={[
            { key: 'title', header: 'Product', render: (p) => <span className="font-semibold text-ink">{p.title}</span> },
            { key: 'category', header: 'Category', render: (p) => <span className="capitalize">{p.category}</span> },
            { key: 'price', header: 'Price', align: 'right', render: (p) => <span className="tabular-nums">{formatPrice(p.price)}</span> },
            { key: 'stock', header: 'Stock', align: 'right', render: (p) => <span className="tabular-nums">{p.stock}</span> },
            { key: 'seoScore', header: 'SEO', align: 'center', render: (p) => <span className="tabular-nums">{p.seoScore}</span> },
          ]}
        />
      </AdminCard>

      <AdminCard title="Audience" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Sessions" value="43,640" delta={9.2} icon={Users} />
          <StatCard label="New visitors" value="71%" delta={3.1} />
          <StatCard label="Returning" value="29%" delta={-1.4} />
        </div>
      </AdminCard>
    </>
  )
}
