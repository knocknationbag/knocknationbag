import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import UserForm from '@/components/admin/users/UserForm'

export const metadata = { title: 'Add user' }

export default function NewUserPage() {
  return (
    <>
      <AdminPageHeader
        title="Add user"
        description="Creates a sign-in account and its profile together. A temporary password is shown once, after saving."
      />
      <UserForm />
    </>
  )
}
