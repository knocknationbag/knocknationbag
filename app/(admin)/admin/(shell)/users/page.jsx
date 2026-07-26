import { Plus } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listUsers } from '@/lib/db/profiles'
import { USER_STATUSES } from '@/constants/recordStatus'
import { deleteUser } from '@/lib/actions/users'
import { friendlyDbError } from '@/lib/db/errors'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Users' }

const PAGE_SIZE = 10

/**
 * Dates are formatted here rather than in the table: the client and server can
 * sit in different time zones, and formatting on both sides is a hydration
 * mismatch waiting to happen.
 */
export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)

  const { rows, total, error, setupRequired } = await listUsers({
    query: params?.q ?? '',
    status: params?.status ?? '',
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Everyone with an account. Creating a user here creates the sign-in account too."
        actions={
          <AdminButton href="/admin/users/new" variant="primary" size="sm" icon={Plus}>
            Add user
          </AdminButton>
        }
      />

      <ServerListModule
        rows={rows.map((u) => ({ ...u, createdLabel: formatAdminDate(u.createdAt) }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search name, email or phone…"
        filters={[{ name: 'status', label: 'Status', options: USER_STATUSES }]}
        deleteAction={deleteUser}
        deleteDescription="This permanently deletes the account and its sign-in access. It cannot be undone."
        emptyTitle="No users yet"
        emptyDescription="Add the first account to get started."
        columns={[
          { key: 'name', header: 'User', type: 'title', imageKey: 'avatarUrl', hrefBase: '/admin/users', linkKey: 'id', width: '28%' },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Phone' },
          { key: 'status', header: 'Status', type: 'status' },
          { key: 'createdLabel', header: 'Created' },
          { key: 'actions', header: '', type: 'actions', align: 'right', label: 'user', editHrefBase: '/admin/users', linkKey: 'id' },
        ]}
      />
    </>
  )
}
