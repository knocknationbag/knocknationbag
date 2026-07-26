import { Clock, Mail, MapPin } from 'lucide-react'

import Container from '@/components/layout/Container'
import PageHeader from '@/components/common/PageHeader'
import ContactForm from '@/components/common/ContactForm'
import { contactChannels } from '@/data/content'

export const metadata = {
  title: 'Contact Us',
  description:
    'Reach the Knock Nation Bag customer care team. Every message answered within one working day.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact Us | Knock Nation Bag', url: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="WE ANSWER PROPERLY"
        title="Contact Us"
        description="A real person replies to every message within one working day. No queue numbers, no chatbots."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <Container className="py-10 md:py-14 xl:py-16">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-16">
          <div>
            <h2 className="text-[22px] font-bold text-ink">Send us a message</h2>
            <p className="mt-2 max-w-[56ch] text-[15px] leading-[26px] text-body">
              Include your order number where you have one — it lets us answer with specifics
              rather than questions.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-card border border-border bg-surface-muted p-6">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
                <Mail size={18} className="text-gold" aria-hidden="true" /> Direct channels
              </h2>
              <dl className="mt-4 flex flex-col gap-4">
                {contactChannels.map((channel) => (
                  <div key={channel.label}>
                    <dt className="text-[13px] text-body">{channel.label}</dt>
                    <dd className="mt-0.5">
                      <a
                        href={channel.href}
                        className="text-[15px] font-semibold text-ink underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        {channel.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-card border border-border bg-surface-muted p-6">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
                <Clock size={18} className="text-gold" aria-hidden="true" /> Care hours
              </h2>
              <p className="mt-3 text-[15px] leading-[26px] text-body">
                Monday to Friday, 9am – 6pm ET<br />
                Saturday, 10am – 4pm ET<br />
                Closed Sundays and public holidays
              </p>
            </div>

            <div className="rounded-card border border-border bg-surface-muted p-6">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
                <MapPin size={18} className="text-gold" aria-hidden="true" /> Workshop
              </h2>
              <p className="mt-3 text-[15px] leading-[26px] text-body">
                Rua da Prata 148<br />
                1100-052 Lisboa<br />
                Portugal
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  )
}
