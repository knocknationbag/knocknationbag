import { Fragment } from 'react'
import { Plus, ShieldCheck } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { PERMISSIONS, roles } from '@/constants/adminRoles'

export const metadata = { title: 'Roles & Permissions' }

const GROUPS = [
  { label: 'Overview', keys: ['DASHBOARD_VIEW', 'ANALYTICS_VIEW'] },
  { label: 'Catalogue', keys: ['CATALOG_VIEW', 'CATALOG_EDIT', 'INVENTORY_EDIT'] },
  { label: 'Sales', keys: ['ORDERS_VIEW', 'ORDERS_EDIT', 'CUSTOMERS_VIEW'] },
  { label: 'Content', keys: ['CONTENT_VIEW', 'CONTENT_EDIT', 'MEDIA_EDIT'] },
  { label: 'SEO', keys: ['SEO_VIEW', 'SEO_EDIT'] },
  { label: 'System', keys: ['USERS_EDIT', 'ROLES_EDIT', 'LOGS_VIEW', 'SETTINGS_EDIT'] },
]

const LABEL = (key) => key.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

export default function AdminRolesPage() {
  const dashboardRoles = roles.filter((r) => r.permissions.length > 0)

  return (
    <>
      <AdminPageHeader
        title="Roles & Permissions"
        description="Nine roles. The matrix below is the single source of truth for what each role may see and do."
        actions={<AdminButton variant="primary" size="sm" icon={Plus}>New role</AdminButton>}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="rounded-media border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="inline-flex items-center gap-1.5 text-admin-lg font-bold text-ink">
                <ShieldCheck size={14} className="text-gold" aria-hidden="true" />
                {role.label}
              </h2>
              <StatusBadge
                status={role.permissions.length ? `${role.permissions.length} perms` : 'No access'}
                tone={role.permissions.length ? role.tone : 'muted'}
              />
            </div>
            <p className="mt-2 text-admin-sm leading-[18px] text-body">{role.description}</p>
          </div>
        ))}
      </div>

      <AdminCard
        title="Permission matrix"
        description="Presentation only — every mutation is re-checked server-side."
        padded={false}
        className="mt-4"
      >
        {/* Below md the matrix is replaced by a per-role list: a 9-column grid is
            unreadable at 390px, and forcing it to scroll made the whole page
            scroll sideways. Same information, breakpoint-appropriate shape. */}
        <ul className="divide-y divide-border md:hidden">
          {dashboardRoles.map((role) => (
            <li key={role.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-admin-md font-bold text-ink">{role.label}</h3>
                <StatusBadge status={`${role.permissions.length} perms`} tone={role.tone} />
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {GROUPS.map((group) => {
                  const granted = group.keys.filter((k) => role.permissions.includes(PERMISSIONS[k]))
                  if (!granted.length) return null
                  return (
                    <li key={group.label}>
                      <span className="inline-flex items-center gap-1 rounded-badge border border-border bg-surface-muted px-2 py-0.5 text-admin-xs text-body">
                        {group.label}
                        <span className="font-mono text-muted">{granted.length}/{group.keys.length}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="hidden w-full max-w-full overflow-x-auto md:block">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="md:sticky md:left-0 bg-surface px-3 py-2.5 text-admin-xs font-semibold uppercase tracking-[0.06em] text-muted">
                  Permission
                </th>
                {dashboardRoles.map((r) => (
                  <th key={r.id} scope="col" className="px-2 py-2.5 text-center text-admin-xs font-semibold text-muted">
                    <span className="block max-w-[72px] leading-tight">{r.label}</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {GROUPS.map((group) => (
                <Fragment key={group.label}>
                  <tr className="border-b border-border bg-surface-muted">
                    <th
                      scope="colgroup"
                      colSpan={dashboardRoles.length + 1}
                      className="md:sticky md:left-0 px-3 py-1.5 font-mono text-admin-xs uppercase tracking-[0.08em] text-body"
                    >
                      {group.label}
                    </th>
                  </tr>

                  {group.keys.map((key) => {
                    const permission = PERMISSIONS[key]
                    return (
                      <tr key={key} className="border-b border-border last:border-0">
                        <th scope="row" className="md:sticky md:left-0 bg-surface px-3 py-2 text-admin font-medium text-ink">
                          {LABEL(key)}
                        </th>
                        {dashboardRoles.map((r) => {
                          const allowed = r.permissions.includes(permission)
                          return (
                            <td key={r.id} className="px-2 py-2 text-center">
                              <span className="sr-only">{allowed ? 'Allowed' : 'Denied'}</span>
                              {allowed ? (
                                <span aria-hidden="true" className="mx-auto block size-1.5 rounded-full bg-verified-fg" />
                              ) : (
                                <span aria-hidden="true" className="mx-auto block h-px w-2.5 bg-border" />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  )
}
