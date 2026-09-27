import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import CouponForm from '@/components/admin/coupons/CouponForm'
import CouponUsageCard from '@/components/admin/coupons/CouponUsageCard'
import { getCoupon } from '@/lib/db/coupons'
import { COUPON_TYPES } from '@/constants/coupons'
import { toIndiaDateInput } from '@/utils/indiaDate'

export const metadata = { title: 'Edit coupon' }

export default async function EditCouponPage({ params }) {
  const { id } = await params
  const { coupon, error } = await getCoupon(id)

  if (error) {
    return (
      <>
        <AdminPageHeader title="Edit coupon" />
        <AdminCard><AuthMessage tone="error">{error}</AuthMessage></AdminCard>
      </>
    )
  }
  if (!coupon) notFound()

  return (
    <>
      <AdminPageHeader
        title={coupon.code}
        description={COUPON_TYPES[coupon.type]}
        actions={<StatusBadge status={coupon.state} />}
      />
      <CouponForm
        key={coupon.id}
        coupon={coupon}
        expiresOn={toIndiaDateInput(coupon.expiresAt)}
        aside={<CouponUsageCard coupon={coupon} />}
      />
    </>
  )
}
