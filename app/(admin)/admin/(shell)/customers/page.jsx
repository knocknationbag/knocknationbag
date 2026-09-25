import { Plus } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listUsers } from '@/lib/db/profiles'
import { USER_STATUSES } from '@/constants/recordStatus'
import { deleteUser } from '@/lib/actions/users'
import { friendlyDbError } from '@/lib/db/errors'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Customers' }

const PAGE_SIZE = 20

/**
 * Everyone with an account. Guest orders (Phase 2) appear under Orders, not
 * here — a guest has no account to manage.
 */
export default async function AdminCustomersPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)

  const { rows, total, error, setupRequired } = await listUsers({
    query: params?.q ?? '',
    status: params?.status ?? '',
    wholesale: params?.wholesale ?? '',
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Everyone with an account. Open a customer to approve them for wholesale pricing."
        actions={
          <AdminButton href="/admin/customers/new" variant="primary" size="sm" icon={Plus}>
            Add customer
          </AdminButton>
        }
      />

      <ServerListModule
        rows={rows.map((u) => ({
          ...u,
          createdLabel: formatAdminDate(u.createdAt),
          wholesaleLabel: u.isWholesaleApproved ? 'Wholesale' : 'Retail',
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search name, email or phone…"
        filters={[
          { name: 'wholesale', label: 'Pricing', options: ['Approved', 'Not approved'] },
          { name: 'status', label: 'Status', options: USER_STATUSES },
        ]}
        deleteAction={deleteUser}
        deleteDescription="This permanently deletes the account and its sign-in access. It cannot be undone."
        emptyTitle="No customers yet"
        emptyDescription="Customers appear here when they create an account."
        columns={[
          { key: 'name', header: 'Customer', type: 'title', imageKey: 'avatarUrl', hrefBase: '/admin/customers', linkKey: 'id', width: '26%' },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Phone' },
          { key: 'wholesaleLabel', header: 'Pricing', type: 'status' },
          { key: 'status', header: 'Status', type: 'status' },
          { key: 'createdLabel', header: 'Joined' },
          { key: 'actions', header: '', type: 'actions', align: 'right', label: 'customer', editHrefBase: '/admin/customers', linkKey: 'id' },
        ]}
      />
    </>
  )
}
