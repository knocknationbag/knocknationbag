import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import UserForm from '@/components/admin/users/UserForm'
import { getUser } from '@/lib/db/profiles'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Edit user' }

export default async function EditUserPage({ params }) {
  const { id } = await params
  const { user, error } = await getUser(id)

  if (error) {
    return (
      <>
        <AdminPageHeader title="Edit user" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!user) notFound()

  return (
    <>
      <AdminPageHeader
        title={user.name || user.email}
        description={`Account created ${formatAdminDate(user.createdAt)}.`}
      />
      <UserForm user={user} />
    </>
  )
}
