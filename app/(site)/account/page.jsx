import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package } from 'lucide-react'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import Tabs from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import AuthNotice from '@/components/auth/AuthNotice'
import SignOutButton from '@/components/auth/SignOutButton'
import AddressBook from '@/components/account/AddressBook'
import ProfileForm from '@/components/account/ProfileForm'
import { getAccount } from '@/lib/auth/account'
import { customerLoginUrlFor } from '@/lib/auth/customerRoutes'
import { listMyOrders } from '@/lib/db/orders'
import { createClient } from '@/lib/supabase/server'
import { ORDER_STATUS_TONE, PAYMENT_STATUS_LABELS } from '@/constants/orders'
import { formatPrice } from '@/utils/formatPrice'
import { formatAdminDate, formatMonthYear } from '@/utils/formatDate'

export const metadata = {
  title: 'My Account',
  description: 'Your Knock Nation Bag orders, addresses and account details.',
  robots: { index: false, follow: false },
}

// Personal: rendered per request for the signed-in visitor, never cached.
export const dynamic = 'force-dynamic'

const NOTICES = {
  welcome: { tone: 'success', text: 'Welcome to Knock Nation Bag — your account is ready.' },
  reset: { tone: 'success', text: 'Your password has been changed. Other devices have been signed out.' },
}

function OrderList({ orders }) {
  if (!orders.length) {
    return (
      <EmptyState icon={Package} title="No orders yet" description="When you place an order while signed in, it appears here."
        actionLabel="Start shopping" actionHref="/shop" />
    )
  }

  return (
    <>
      <h2 className="sr-only">Your orders</h2>
      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-card border border-border bg-surface p-5 xl:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[16px] font-bold text-ink">{order.number}</p>
                <p className="mt-0.5 text-[14px] text-body">Placed {formatAdminDate(order.createdAt)} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={ORDER_STATUS_TONE[order.status] ?? 'neutral'}>{order.status}</Badge>
                <p className="text-[16px] font-bold text-ink">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex -space-x-2">
                {order.items.slice(0, 4).map((item) => (
                  <li key={item.id} className="relative size-12 overflow-hidden rounded-media border-2 border-surface bg-surface-muted">
                    {item.image ? <Image src={item.image} alt="" fill sizes="48px" className="object-cover" /> : null}
                  </li>
                ))}
              </ul>
              <p className="flex-1 text-[14px] text-body">
                {order.itemCount} item{order.itemCount === 1 ? '' : 's'}: {order.items.map((item) => item.name).slice(0, 2).join(', ')}{order.items.length > 2 ? '…' : ''}
              </p>
              <Link href={`/account/orders/${order.number}`}
                className="text-[14px] font-semibold text-ink underline underline-offset-4 hover:text-gold">
                View order
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default async function AccountPage({ searchParams }) {
  // The proxy already redirects guests; this is the real check (getUser()).
  const account = await getAccount()
  if (account.status === 'guest') redirect(customerLoginUrlFor('/account'))

  const supabase = await createClient()
  const [params, orders, { data: addresses }, { data: profile }] = await Promise.all([
    searchParams,
    listMyOrders(),
    supabase.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at'),
    supabase.from('profiles').select('phone').eq('id', account.id).maybeSingle(),
  ])
  const notice = params?.welcome ? NOTICES.welcome : params?.reset ? NOTICES.reset : null
  const memberSince = formatMonthYear(account.memberSince)

  return (
    <>
      <PageHeader
        eyebrow={account.roleLabel ? account.roleLabel.toUpperCase() : 'MY ACCOUNT'}
        title={`Hello, ${account.firstName}`}
        description={[memberSince && `Member since ${memberSince}`, account.email].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'My Account' }]}
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {account.status === 'admin' ? (
            <Button href="/admin/dashboard" variant="primary" size="md" className="w-full sm:w-auto">Admin dashboard</Button>
          ) : null}
          <SignOutButton className="w-full sm:w-auto" />
        </div>
      </PageHeader>

      <Container className="py-10 md:py-14 xl:py-16">
        {notice ? <AuthNotice tone={notice.tone} className="mb-8">{notice.text}</AuthNotice> : null}

        <Tabs
          tabs={[
            { id: 'orders', label: `Orders (${orders.length})`, content: <OrderList orders={orders} /> },
            { id: 'addresses', label: 'Addresses', content: <AddressBook addresses={addresses ?? []} /> },
            {
              id: 'details',
              label: 'Details',
              content: <ProfileForm profile={{ name: account.name, email: account.email, phone: profile?.phone ?? '' }} />,
            },
          ]}
        />
      </Container>
    </>
  )
}
