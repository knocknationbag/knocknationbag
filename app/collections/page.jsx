import Image from 'next/image'
import Link from 'next/link'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import { collections } from '@/data/catalog'
import { products } from '@/data/products'

export const metadata = {
  title: 'Collections',
  description:
    'Curated edits from the Knock Nation Bag range — new arrivals, best sellers, the featured collection and current reductions.',
  alternates: { canonical: '/collections' },
  openGraph: { title: 'Collections | Knock Nation Bag', url: '/collections' },
}

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="CURATED EDITS"
        title="Collections"
        description="Four ways into the range, each assembled around a different reason to buy."
        breadcrumbs={[{ label: 'Collections' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <ul className="grid gap-4 md:grid-cols-2 xl:gap-6">
          {collections.map((collection) => {
            const count = products.filter(collection.match).length
            return (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group relative block h-[220px] overflow-hidden rounded-card md:h-[280px] xl:h-[340px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <Image
                    src={collection.image}
                    alt={collection.imageAlt}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-6 bottom-6">
                    <span className="block font-mono text-eyebrow uppercase text-gold">{collection.eyebrow}</span>
                    <span className="mt-2 block text-[22px] font-bold text-white xl:text-[26px]">{collection.title}</span>
                    <span className="mt-1 block text-[14px] text-white/80">{count} products</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </>
  )
}
