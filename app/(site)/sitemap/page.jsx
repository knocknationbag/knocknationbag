import Link from 'next/link'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import { categories } from '@/data/categories'
import { collections } from '@/data/catalog'
import { products } from '@/data/products'
import { footerColumns } from '@/constants/navigation'

export const metadata = {
  title: 'Sitemap',
  description: 'Every page on the Knock Nation Bag website, in one index.',
  alternates: { canonical: '/sitemap' },
  openGraph: { title: 'Sitemap | Knock Nation Bag', url: '/sitemap' },
}

function LinkGroup({ heading, links }) {
  return (
    <section>
      <h2 className="font-mono text-eyebrow uppercase text-gold">{heading}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[15px] text-body transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function SitemapPage() {
  return (
    <>
      <PageHeader
        eyebrow="EVERY PAGE"
        title="Sitemap"
        description="A complete index of the site — useful for finding a policy, a category or a specific product quickly."
        breadcrumbs={[{ label: 'Sitemap' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <LinkGroup
            heading="Browse"
            links={[
              { label: 'Home', href: '/' },
              { label: 'Shop all', href: '/shop' },
              { label: 'All categories', href: '/categories' },
              { label: 'Collections', href: '/collections' },
              { label: 'Search', href: '/search' },
            ]}
          />

          <LinkGroup
            heading="Categories"
            links={categories.map((c) => ({ label: c.title, href: `/category/${c.slug}` }))}
          />

          <LinkGroup
            heading="Collections"
            links={collections.map((c) => ({ label: c.title, href: `/collections/${c.slug}` }))}
          />

          <LinkGroup
            heading="Your account"
            links={[
              { label: 'My account', href: '/account' },
              { label: 'Wishlist', href: '/wishlist' },
              { label: 'Cart', href: '/cart' },
              { label: 'Checkout', href: '/checkout' },
              { label: 'Sign in', href: '/login' },
              { label: 'Create account', href: '/register' },
              { label: 'Forgot password', href: '/forgot-password' },
            ]}
          />

          {footerColumns.map((column) => (
            <LinkGroup key={column.heading} heading={column.heading} links={column.links} />
          ))}

          <LinkGroup
            heading="Company"
            links={[
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Refund Policy', href: '/refund' },
            ]}
          />
        </div>

        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-mono text-eyebrow uppercase text-gold">All products</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.slug}`}
                  className="text-[15px] text-body transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {product.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  )
}
