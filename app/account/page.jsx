import Image from 'next/image'
import Link from 'next/link'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import Tabs from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import { addresses, customer, orders, wishlistSlugs } from '@/data/account'
import { products } from '@/data/products'
import { formatPrice } from '@/utils/formatPrice'

export const metadata = {
  title: 'My Account',
  description: 'Manage your Knock Nation Bag orders, addresses and wishlist.',
  robots: { index: false, follow: false },
}

const STATUS_TONE = {
  Delivered: 'verified',
  'In transit': 'new',
  Cancelled: 'neutral',
}

function Orders() {
  return (
    <>
    <h2 className="sr-only">Your orders</h2>
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded-card border border-border bg-surface p-5 xl:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-[16px] font-bold text-ink">{order.id}</p>
              <p className="mt-0.5 text-[14px] text-body">Placed {order.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={STATUS_TONE[order.status] ?? 'neutral'}>{order.status}</Badge>
              <p className="text-[16px] font-bold text-ink">{formatPrice(order.total)}</p>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.slug} className="flex items-center gap-4">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-media border border-border">
                  <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="block truncate text-[15px] font-semibold text-ink hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {item.title}
                  </Link>
                  <span className="block text-[13px] text-body">Qty {item.qty}</span>
                </span>
                <span className="text-[15px] font-semibold text-ink">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
    </>
  )
}

function Addresses() {
  return (
    <div>
      <h2 className="sr-only">Saved addresses</h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className="rounded-card border border-border bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[16px] font-bold text-ink">{address.label}</h3>
              {address.isDefault ? <Badge variant="verified">Default</Badge> : null}
            </div>
            <address className="mt-3 text-[15px] not-italic leading-[24px] text-body">
              {address.name}
              <br />
              {address.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              {address.country}
              <br />
              {address.phone}
            </address>
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="md" className="mt-6">Add a new address</Button>
    </div>
  )
}

export default function AccountPage() {
  const wishlist = wishlistSlugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean)

  return (
    <>
      <PageHeader
        eyebrow={customer.tier}
        title={`Hello, ${customer.name.split(' ')[0]}`}
        description={`Member since ${customer.memberSince} · ${customer.email}`}
        breadcrumbs={[{ label: 'My Account' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <Tabs
          tabs={[
            { id: 'orders', label: `Orders (${orders.length})`, content: <Orders /> },
            { id: 'addresses', label: 'Addresses', content: <Addresses /> },
            {
              id: 'wishlist',
              label: `Wishlist (${wishlist.length})`,
              content: (
                <>
                  <h2 className="sr-only">Saved to your wishlist</h2>
                  <ProductGrid products={wishlist} columns={4} />
                </>
              ),
            },
            {
              id: 'details',
              label: 'Details',
              content: (
                <>
                <h2 className="sr-only">Account details</h2>
                <dl className="max-w-[420px] rounded-card border border-border bg-surface p-6">
                  {[
                    ['Name', customer.name],
                    ['Email', customer.email],
                    ['Member since', customer.memberSince],
                    ['Tier', customer.tier],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-border py-3 last:border-0">
                      <dt className="text-[15px] text-body">{label}</dt>
                      <dd className="text-[15px] font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                </>
              ),
            },
          ]}
        />

        <p className="mt-10 border-t border-border pt-6 text-[14px] text-body">
          This account view is populated with demonstration data.{' '}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
            Sign in
          </Link>{' '}
          screens are UI only — authentication arrives in a later phase.
        </p>
      </Container>
    </>
  )
}
