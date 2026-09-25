import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Banknote, ShieldCheck, Truck } from 'lucide-react'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import Breadcrumb from '@/components/common/Breadcrumb'
import SectionHeader from '@/components/common/SectionHeader'
import JsonLd from '@/components/common/JsonLd'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import ProductGallery from '@/components/product/ProductGallery'
import ProductGrid from '@/components/product/ProductGrid'
import ProductPurchase from '@/components/product/ProductPurchase'
import WholesaleOffer from '@/components/product/WholesaleOffer'
import { getCatalog, getCategoryBySlug, getProductBySlug, getRelatedProducts } from '@/lib/catalog'
import { site } from '@/constants/site'

/** Only what has been decided for V1 — no invented delivery times or return windows. */
const PROMISES = [
  { icon: Banknote, label: 'Cash on Delivery available' },
  { icon: ShieldCheck, label: 'Secure online payment' },
  { icon: Truck, label: 'Delivered to your door' },
]

const absolute = (src) => (src?.startsWith('http') ? src : `${site.url}${src}`)

/** Pre-render every published product; new ones render on first visit. */
export async function generateStaticParams() {
  const { products } = await getCatalog()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const title = product.seo.title || product.title
  const description = product.seo.description || `${product.title} from Knock Nation Bag.`
  const image = product.seo.ogImage || product.image

  return {
    title,
    description,
    alternates: { canonical: product.seo.canonical || `/product/${slug}` },
    robots: product.seo.robots?.startsWith('noindex') ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      title: product.seo.ogTitle || `${title} | Knock Nation Bag`,
      description: product.seo.ogDescription || description,
      url: `/product/${slug}`,
      images: [{ url: image, alt: product.imageAlt }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | Knock Nation Bag`, description, images: [image] },
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [category, related] = await Promise.all([
    product.category ? getCategoryBySlug(product.category) : null,
    getRelatedProducts(product, 4),
  ])

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.longDescription || undefined,
    image: product.gallery.map(absolute),
    sku: product.sku || undefined,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type': 'Offer',
      url: `${site.url}/product/${product.slug}`,
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  const details = [
    product.material && ['Material', product.material],
    category && ['Category', category.title],
    product.sku && ['SKU', product.sku],
  ].filter(Boolean)

  return (
    <>
      <JsonLd data={ld} />

      <Container className="py-6">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            ...(category?.parent ? [{ label: category.parent.title, href: `/category/${category.parent.slug}` }] : []),
            ...(category ? [{ label: category.title, href: `/category/${category.slug}` }] : []),
            { label: product.title },
          ]}
        />
      </Container>

      <Container className="pb-12 md:pb-16 xl:pb-20">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 xl:gap-16">
          <ProductGallery
            images={product.gallery}
            alt={product.imageAlt}
            badge={
              product.discount > 0 ? (
                <Badge variant="new" className="absolute left-4 top-4">
                  −{product.discount}%
                </Badge>
              ) : null
            }
          />

          <div>
            {product.brand ? <p className="font-mono text-eyebrow uppercase text-gold">{product.brand}</p> : null}
            <h1 className="mt-3 text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">{product.title}</h1>

            {product.shortDescription ? (
              <p className="mt-5 max-w-[60ch] text-lead text-body">{product.shortDescription}</p>
            ) : null}

            <ProductPurchase product={product} />
            <WholesaleOffer productId={product.id} />

            {details.length ? (
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 text-[14px]">
                {details.map(([label, value]) => (
                  <div key={label}>
                    <dt className="inline text-body">{label}: </dt>
                    <dd className="inline font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
              {PROMISES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-[14px] text-body">
                  <Icon size={18} strokeWidth={2} className="text-gold" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Tabs
          className="mt-14 xl:mt-20"
          tabs={[
            {
              id: 'description',
              label: 'Description',
              content: (
                <div className="max-w-[70ch] whitespace-pre-line text-[16px] leading-[28px] text-body">
                  {product.longDescription || product.shortDescription || 'Full description coming soon.'}
                </div>
              ),
            },
            ...(product.specifications.length
              ? [{
                  id: 'specifications',
                  label: 'Specifications',
                  content: (
                    <table className="w-full max-w-[560px] text-left text-[15px]">
                      <tbody>
                        {product.specifications.map((spec) => (
                          <tr key={spec.label} className="border-b border-border last:border-0">
                            <th scope="row" className="py-3 pr-6 font-semibold text-ink">{spec.label}</th>
                            <td className="py-3 text-body">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ),
                }]
              : []),
            {
              id: 'shipping',
              label: 'Delivery & Returns',
              content: (
                <div className="max-w-[70ch] text-[15px] leading-[26px] text-body">
                  <p>
                    Pay online or choose Cash on Delivery at checkout. Delivery charges are shown in your
                    cart before you pay.
                  </p>
                  <p className="mt-4">
                    Read our <Link href="/shipping" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">shipping policy</Link> and{' '}
                    <Link href="/returns" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">return policy</Link>.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </Container>

      {related.length > 0 ? (
        <Section background="muted">
          <SectionHeader eyebrow="MORE TO EXPLORE" title="You May Also Like" />
          <ProductGrid products={related} columns={4} />
        </Section>
      ) : null}
    </>
  )
}
