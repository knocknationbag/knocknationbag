import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import UserForm from '@/components/admin/users/UserForm'
import { getUser } from '@/lib/db/profiles'
import { formatAdminDate } from '@/utils/formatDate'

export const metadata = { title: 'Customer' }

export default async function EditCustomerPage({ params }) {
  const { id } = await params
  const { user, error } = await getUser(id)

  if (error) {
    return (
      <>
        <AdminPageHeader title="Customer" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!user) notFound()

  return (
    <>
      <AdminPageHeader
        title={user.name || user.email}
        description={`Customer since ${formatAdminDate(user.createdAt)} · ${user.isWholesaleApproved ? 'Approved wholesale' : 'Retail pricing'}`}
      />
      <UserForm user={user} />
    </>
  )
}
