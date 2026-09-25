import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import UserForm from '@/components/admin/users/UserForm'

export const metadata = { title: 'Add customer' }

/** For customers you sign up yourself — typically a wholesale buyer. */
export default function NewCustomerPage() {
  return (
    <>
      <AdminPageHeader
        title="Add customer"
        description="Creates their sign-in account. A temporary password is shown once, after saving."
      />
      <UserForm />
    </>
  )
}
