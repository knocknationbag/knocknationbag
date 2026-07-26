'use client'

import { useState } from 'react'

import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'

/**
 * Static contact form. Phase 2 has no backend, so submission is validated
 * client-side and acknowledged inline — the markup is ready for a Server Action.
 */
export default function ContactForm() {
  const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState({})

  function handleSubmit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const next = {}

    if (!data.name?.trim()) next.name = 'Please tell us your name.'
    if (!data.email?.trim()) next.email = 'We need an email address to reply.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = 'That email address does not look right.'
    if (!data.message?.trim()) next.message = 'Please add a message.'

    setErrors(next)
    if (Object.keys(next).length) {
      setStatus({ tone: 'error', text: 'Please correct the highlighted fields.' })
      return
    }

    setStatus({ tone: 'success', text: 'Thank you — we will reply within one working day.' })
    event.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="contact-name" name="name" label="Your name" placeholder="Marcus Sterling" error={errors.name} autoComplete="name" />
        <Field id="contact-email" name="email" type="email" label="Email address" placeholder="you@example.com" error={errors.email} autoComplete="email" />
      </div>

      <Field id="contact-order" name="order" label="Order number" hint="Optional — it helps us find you faster." placeholder="KNB-00000" />

      <Field id="contact-subject" name="subject" as="select" label="What is this about?" defaultValue="order">
        <option value="order">An order</option>
        <option value="return">A return or exchange</option>
        <option value="warranty">A warranty claim</option>
        <option value="product">A product question</option>
        <option value="press">Press or partnerships</option>
      </Field>

      <Field id="contact-message" name="message" as="textarea" label="Message" placeholder="How can we help?" error={errors.message} />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="md">Send message</Button>
        <p
          aria-live="polite"
          className={`text-[14px] ${status?.tone === 'error' ? 'text-danger' : 'text-verified-fg'}`}
        >
          {status?.text ?? ''}
        </p>
      </div>
    </form>
  )
}
