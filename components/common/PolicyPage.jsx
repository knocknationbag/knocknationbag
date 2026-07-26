import { notFound } from 'next/navigation'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import { policies } from '@/data/content'

/**
 * Shared body for every policy page. Each policy gets its own explicit route
 * file (app/shipping, app/returns, …) rather than a root-level [policy] segment,
 * which would swallow all unknown top-level URLs and break the static 404.
 */
export default function PolicyPage({ slug }) {
  const doc = policies[slug]
  if (!doc) notFound()

  return (
    <>
      <PageHeader
        eyebrow="THE FINE PRINT"
        title={doc.title}
        description={doc.intro}
        breadcrumbs={[{ label: doc.title }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <div className="max-w-[70ch]">
          <p className="font-mono text-eyebrow uppercase text-gold">Last updated {doc.updated}</p>

          {doc.sections.map((section) => (
            <section key={section.heading} className="mt-10 first:mt-8">
              <h2 className="text-[20px] font-bold text-ink xl:text-[22px]">{section.heading}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i} className="mt-4 text-[16px] leading-[28px] text-body">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <p className="mt-12 border-t border-border pt-6 text-[15px] text-body">
            Questions about this policy? Email{' '}
            <a
              href="mailto:care@knocknationbag.com"
              className="font-semibold text-ink underline underline-offset-4 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              care@knocknationbag.com
            </a>{' '}
            and we will answer within one working day.
          </p>
        </div>
      </Container>
    </>
  )
}

/** Shared metadata builder so each policy route stays a three-line file. */
export function policyMetadata(slug) {
  const doc = policies[slug]
  if (!doc) return {}
  return {
    title: doc.title,
    description: doc.intro,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: `${doc.title} | Knock Nation Bag`, description: doc.intro, url: `/${slug}` },
  }
}
