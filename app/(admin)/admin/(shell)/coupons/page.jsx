import { Plus } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminButton from '@/components/admin/ui/AdminButton'
import ServerListModule from '@/components/admin/modules/ServerListModule'
import { listCoupons } from '@/lib/db/coupons'
import { deleteCoupon } from '@/lib/actions/coupons'
import { friendlyDbError } from '@/lib/db/errors'
import { COUPON_TYPES } from '@/constants/coupons'
import { formatPrice } from '@/utils/formatPrice'
import { formatIndiaDate } from '@/utils/indiaDate'

export const metadata = { title: 'Coupons' }

const PAGE_SIZE = 20

function valueLabel(coupon) {
  if (coupon.type === 'free_shipping') return 'Free shipping'
  if (coupon.type === 'percentage') return `${coupon.value}%${coupon.maxDiscountAmount ? ` · max ${formatPrice(coupon.maxDiscountAmount)}` : ''}`
  return formatPrice(coupon.value)
}

/** Discount codes. Used coupons are archived, never deleted — orders reference them. */
export default async function AdminCouponsPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page) || 1)
  const { rows, total, error, setupRequired } = await listCoupons({
    query: params?.q ?? '',
    state: params?.state ?? '',
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Discount codes customers enter in the cart. Discounts are always calculated on the server."
        actions={<AdminButton href="/admin/coupons/new" variant="primary" size="sm" icon={Plus}>New coupon</AdminButton>}
      />

      <ServerListModule
        rows={rows.map((c) => ({
          ...c,
          name: c.code,
          kind: COUPON_TYPES[c.type],
          value: valueLabel(c),
          minimum: c.minOrderAmount ? formatPrice(c.minOrderAmount) : '—',
          uses: `${c.used}${c.usageLimit ? ` / ${c.usageLimit}` : ''}${c.held ? ` (+${c.held} held)` : ''}`,
          expires: c.expiresAt ? formatIndiaDate(c.expiresAt) : 'No expiry',
          status: c.state,
          // Mirrors public_coupons(): public + active + unexpired + not used up.
          website: !c.isPublic ? 'Hidden' : c.state === 'Active' && !(c.usageLimit && c.used + c.held >= c.usageLimit) ? 'Shown' : 'Not shown',
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        setupRequired={setupRequired}
        error={error ? friendlyDbError(error) : null}
        searchPlaceholder="Search code or note…"
        filters={[{ name: 'state', label: 'Status', options: ['Active', 'Disabled', 'Expired', 'Archived'] }]}
        deleteAction={deleteCoupon}
        deleteDescription="Only a coupon that has never been used can be deleted. A used coupon must be archived instead, so its orders keep their record."
        emptyTitle="No coupons yet"
        emptyDescription="Create a coupon to offer a percentage, flat or free-shipping discount."
        columns={[
          { key: 'name', header: 'Code', type: 'title', hrefBase: '/admin/coupons', linkKey: 'id', width: '16%' },
          { key: 'kind', header: 'Type' },
          { key: 'value', header: 'Value', type: 'strong' },
          { key: 'minimum', header: 'Min. order' },
          { key: 'uses', header: 'Uses' },
          { key: 'expires', header: 'Expires' },
          { key: 'status', header: 'Status', type: 'status' },
          { key: 'website', header: 'Website', type: 'status' },
          { key: 'actions', header: '', type: 'actions', align: 'right', label: 'coupon', editHrefBase: '/admin/coupons', linkKey: 'id' },
        ]}
      />
    </>
  )
}
