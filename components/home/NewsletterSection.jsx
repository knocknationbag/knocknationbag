import Section from '@/components/layout/Section'
import Newsletter from '@/components/common/Newsletter'

export default function NewsletterSection() {
  return (
    <Section background="muted">
      <Newsletter
        title="Join the Nation"
        description="Be the first to know about new arrivals, limited-edition collection drops, and exclusive brand access."
      />
    </Section>
  )
}
