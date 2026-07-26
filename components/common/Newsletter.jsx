'use client'

import { useState } from 'react'

import Button from '@/components/ui/Button'

/**
 * docs/design.md §10.7. Client-side validation only in Phase 1 — no backend yet.
 * Status is announced via aria-live so screen readers hear the result.
 */
export default function Newsletter({
  title = 'Join the Nation',
  description,
  onSubmit,
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your email address.' })
      return
    }

    onSubmit?.(email)
    setStatus({ type: 'success', message: 'Thanks — you are on the list.' })
    setEmail('')
  }

  return (
    <div className="text-center">
      <h2 className="font-extrabold text-h2-plain text-ink md:text-h2-plain-md xl:text-h2-plain-xl">
        {title}
      </h2>

      {description ? (
        <p className="mx-auto mt-3 max-w-[620px] text-[16px] leading-[26px] text-body">
          {description}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto mt-7 flex w-full max-w-[500px] flex-col gap-3 md:mt-8 md:flex-row md:items-center md:gap-[13px]"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-describedby={status ? 'newsletter-status' : undefined}
          className="h-12 w-full rounded-full border border-border bg-white px-6 text-[16px] text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:h-[50px] md:flex-1"
        />
        <Button type="submit" variant="primary" size="md" className="w-full md:w-[130px] md:shrink-0">
          Subscribe
        </Button>
      </form>

      <p
        id="newsletter-status"
        aria-live="polite"
        className="mt-3 min-h-5 text-[14px] text-body empty:mt-0 empty:min-h-0"
      >
        {status?.message ?? ''}
      </p>
    </div>
  )
}
