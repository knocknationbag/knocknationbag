import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check, RefreshCw, ShieldCheck, Truck } from 'lucide-react'

import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import Breadcrumb from '@/components/common/Breadcrumb'
import SectionHeader from '@/components/common/SectionHeader'
import ReviewCard from '@/components/common/ReviewCard'
import JsonLd from '@/components/common/JsonLd'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import QuantityStepper from '@/components/ui/QuantityStepper'
import ProductGallery from '@/components/product/ProductGallery'
import ProductGrid from '@/components/product/ProductGrid'
import RecentlyViewed from '@/components/product/RecentlyViewed'
import Rating from '@/components/product/Rating'
import PriceTag from '@/components/product/PriceTag'
import WishlistButton from '@/components/product/WishlistButton'
import { products, getProductBySlug, getRelatedProducts } from '@/data/products'
import { getCategory } from '@/data/catalog'
import { reviews } from '@/data/reviews'
import { site } from '@/constants/site'

const PROMISES = [
  { icon: Truck, label: 'Free delivery over $150' },
  { icon: RefreshCw, label: '30-day returns' },
  { icon: ShieldCheck, label: '3-year warranty' },
]

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      type: 'website',
      title: `${product.title} | Knock Nation Bag`,
      description: product.shortDescription,
      url: `/product/${slug}`,
      images: [{ url: product.image, alt: product.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Knock Nation Bag`,
      description: product.shortDescription,
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const category = getCategory(product.category)
  const related = getRelatedProducts(product, 4)

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription,
    image: `${site.url}${product.image}`,
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand },
    color: product.color,
    material: product.material,
    offers: {
      '@type': 'Offer',
      url: `${site.url}/product/${product.slug}`,
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <JsonLd data={ld} />

      <Container className="py-6">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            { label: category?.title ?? 'Products', href: `/category/${product.category}` },
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
            <p className="font-mono text-eyebrow uppercase text-gold">{product.brand}</p>
            <h1 className="mt-3 text-h2 font-extrabold text-ink md:text-h2-md xl:text-h2-xl">
              {product.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Rating value={product.rating} size={16} />
              <Link href="#reviews" className="text-[14px] text-body underline-offset-4 hover:text-gold hover:underline">
                {product.reviewCount} reviews
              </Link>
            </div>

            <div className="mt-6 flex items-end gap-4">
              <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
              {product.discount > 0 ? <Badge variant="new">Save {product.discount}%</Badge> : null}
            </div>

            <p className="mt-6 max-w-[60ch] text-lead text-body">{product.shortDescription}</p>

            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
              <div><dt className="inline text-body">Colour: </dt><dd className="inline font-semibold text-ink">{product.color}</dd></div>
              <div><dt className="inline text-body">Material: </dt><dd className="inline font-semibold text-ink">{product.material}</dd></div>
              <div><dt className="inline text-body">Category: </dt><dd className="inline font-semibold text-ink">{category?.title}</dd></div>
              <div>
                <dt className="inline text-body">Availability: </dt>
                <dd className={`inline font-semibold ${product.inStock ? 'text-verified-fg' : 'text-danger'}`}>
                  {product.inStock ? 'In stock' : 'Out of stock'}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuantityStepper max={product.inStock ? 10 : 1} />
              <Button variant="primary" size="lg" className="flex-1 sm:flex-none" disabled={!product.inStock}>
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <WishlistButton
                productId={product.slug}
                title={product.title}
                className="border border-border !size-12 hover:border-border-hover"
              />
            </div>

            <ul className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
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
                <div className="max-w-[70ch]">
                  <p className="text-[16px] leading-[28px] text-body">{product.longDescription}</p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-[15px] text-body">
                        <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            },
            {
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
            },
            {
              id: 'shipping',
              label: 'Shipping & Returns',
              content: (
                <div className="max-w-[70ch] text-[15px] leading-[26px] text-body">
                  <p>Standard delivery is free on orders over $150 and arrives in 3–5 working days. Express delivery arrives next working day when ordered before 2pm.</p>
                  <p className="mt-4">Returns are free within the United States for 30 days from delivery. Read the full <Link href="/returns" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">return policy</Link> and <Link href="/warranty" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">warranty terms</Link>.</p>
                </div>
              ),
            },
          ]}
        />
      </Container>

      <Section background="muted" id="reviews">
        <SectionHeader eyebrow="THE NATION SPEAKS" title="Customer Reviews" />
        <ul className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-6">
          {reviews.map((review) => (
            <li key={review.id} className="flex">
              <ReviewCard {...review} className="w-full !bg-surface" />
            </li>
          ))}
        </ul>
      </Section>

      {related.length > 0 ? (
        <Section background="surface">
          <SectionHeader eyebrow="COMPLETE THE SYSTEM" title="You May Also Like" />
          <ProductGrid products={related} columns={4} />
        </Section>
      ) : null}

      <RecentlyViewed currentSlug={product.slug} allProducts={products} />
    </>
  )
}
