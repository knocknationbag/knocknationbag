import Link from 'next/link'
import { CircleAlert, ExternalLink, FileText, Package, Shapes, TriangleAlert } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import StatCard from '@/components/admin/ui/StatCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import DataTable from '@/components/admin/ui/DataTable'
import { adminBlog, adminCategories, adminCollections, adminPages, adminProducts, adminRedirects } from '@/data/admin'
import { mediaItems } from '@/data/media'
import { mediaStats } from '@/lib/admin/media'

export const metadata = { title: 'SEO Overview' }

const MODULES = [
  { label: 'Products', href: '/admin/products', rows: adminProducts, icon: Package },
  { label: 'Categories', href: '/admin/categories', rows: adminCategories, icon: Shapes },
  { label: 'Collections', href: '/admin/collections', rows: adminCollections, icon: Shapes },
  { label: 'CMS Pages', href: '/admin/pages', rows: adminPages, icon: FileText },
  { label: 'Blog', href: '/admin/blog', rows: adminBlog, icon: FileText },
]

const avg = (rows) => Math.round(rows.reduce((n, r) => n + (r.seoScore ?? 0), 0) / rows.length)

export default function AdminSeoPage() {
  const all = MODULES.flatMap((m) => m.rows.map((r) => ({ ...r, module: m.label, href: m.href })))
  const siteAvg = avg(all)
  const weak = all.filter((r) => r.seoScore < 70).sort((a, b) => a.seoScore - b.seoScore)
  // Read from the Media Library so this count can never disagree with it.
  const missingAlt = mediaStats(mediaItems).missingAlt

  return (
    <>
      <AdminPageHeader
        title="SEO Overview"
        description="Site-wide SEO health. Every content type carries the same field set, so these scores are directly comparable."
        actions={
          <>
            <AdminButton href="/admin/redirects" size="sm">Redirects</AdminButton>
            <AdminButton href="/sitemap.xml" size="sm" icon={ExternalLink}>sitemap.xml</AdminButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average SEO score" value={String(siteAvg)} hint="target 85+" />
        <StatCard label="Records below 70" value={String(weak.length)} hint="needs attention" />
        <StatCard label="Images missing alt" value={String(missingAlt)} hint="accessibility + image search" />
        <StatCard label="Active redirects" value={String(adminRedirects.filter((r) => r.status === 'Active').length)} hint={`${adminRedirects.length} total`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <AdminCard title="Score by module" description="Average readiness across each content type">
          <ul className="flex flex-col gap-3">
            {MODULES.map((m) => {
              const score = avg(m.rows)
              const bar = score >= 85 ? 'bg-verified-fg' : score >= 70 ? 'bg-gold' : 'bg-danger'
              return (
                <li key={m.label}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <Link href={m.href} className="inline-flex items-center gap-1.5 text-admin font-medium text-ink hover:text-gold">
                      <m.icon size={13} aria-hidden="true" /> {m.label}
                    </Link>
                    <span className="text-admin-sm tabular-nums text-body">
                      <span className="font-bold text-ink">{score}</span> · {m.rows.length} records
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </AdminCard>

        <AdminCard title="Open issues" description="Ordered by impact">
          <ul className="flex flex-col gap-2.5">
            {[
              { level: 'error', text: `${weak.length} records score below 70 and will underperform in search.` },
              { level: 'error', text: `${missingAlt} images have no alt text — an accessibility failure as well as an SEO one.` },
              { level: 'warning', text: '4 pages have no meta description, so Google will generate one.' },
              { level: 'warning', text: '3 products have no structured data, losing rich-result eligibility.' },
              { level: 'warning', text: '1 redirect is inactive but still receiving traffic.' },
            ].map((issue) => {
              const Icon = issue.level === 'error' ? CircleAlert : TriangleAlert
              return (
                <li key={issue.text} className="flex gap-2">
                  <Icon
                    size={14}
                    className={`mt-0.5 shrink-0 ${issue.level === 'error' ? 'text-danger' : 'text-[#8A6D1F]'}`}
                    aria-hidden="true"
                  />
                  <span className="text-admin-sm leading-[18px] text-body">{issue.text}</span>
                </li>
              )
            })}
          </ul>
        </AdminCard>
      </div>

      <AdminCard title="Lowest scoring records" description="Fix these first" padded={false} className="mt-4">
        <DataTable
          rows={weak.slice(0, 12)}
          getRowKey={(r) => `${r.module}-${r.id}`}
          columns={[
            {
              key: 'title', header: 'Record', width: '38%',
              render: (r) => (
                <Link href={r.href} className="font-semibold text-ink hover:text-gold">{r.title}</Link>
              ),
            },
            { key: 'module', header: 'Module' },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            {
              key: 'seoScore', header: 'Score', align: 'center',
              render: (r) => <StatusBadge status={String(r.seoScore)} tone={r.seoScore >= 70 ? 'warning' : 'danger'} />,
            },
          ]}
        />
      </AdminCard>
    </>
  )
}
