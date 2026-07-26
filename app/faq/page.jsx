import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import Accordion from '@/components/ui/Accordion'
import Button from '@/components/ui/Button'
import JsonLd from '@/components/common/JsonLd'
import { faqs } from '@/data/content'

export const metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers on delivery times, returns, the three-year warranty, leather care and monogramming.',
  alternates: { canonical: '/faq' },
  openGraph: { title: 'FAQ | Knock Nation Bag', url: '/faq' },
}

export default function FaqPage() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    ),
  }

  return (
    <>
      <JsonLd data={ld} />

      <PageHeader
        eyebrow="EVERYTHING ANSWERED"
        title="Frequently Asked Questions"
        description="Delivery, returns, warranty and care — the questions we are asked most, answered properly."
        breadcrumbs={[{ label: 'FAQ' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <div className="mx-auto max-w-[840px]">
          {faqs.map((group) => (
            <section key={group.group} className="mt-10 first:mt-0">
              <h2 className="mb-4 text-[20px] font-bold text-ink xl:text-[22px]">{group.group}</h2>
              <Accordion items={group.items} defaultOpen={-1} />
            </section>
          ))}

          <div className="mt-12 rounded-card border border-border bg-surface-muted p-8 text-center">
            <h2 className="text-[20px] font-bold text-ink">Still need a hand?</h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-[26px] text-body">
              Our customer care team answers every message within one working day — no queues,
              no chatbots.
            </p>
            <Button href="/contact" variant="primary" size="md" className="mt-6">
              Contact us
            </Button>
          </div>
        </div>
      </Container>
    </>
  )
}
