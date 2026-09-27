import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import CouponForm from '@/components/admin/coupons/CouponForm'

export const metadata = { title: 'New coupon' }

export default function NewCouponPage() {
  return (
    <>
      <AdminPageHeader title="New coupon" description="Percentage, flat amount or free shipping, with optional limits." />
      <CouponForm />
    </>
  )
}
