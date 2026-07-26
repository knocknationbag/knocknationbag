'use client'

import Image from 'next/image'
import { CheckCircle2, CircleAlert, Globe, TriangleAlert } from 'lucide-react'

import { seoScore } from '@/lib/admin/seo'
import { cn } from '@/utils/cn'

const truncate = (value, max) => (value?.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value)

/** Live Google SERP preview. Mirrors desktop result truncation. */
export function GooglePreview({ seo, baseUrl = 'knocknationbag.com', pathPrefix = 'product' }) {
  const title = truncate(seo.title || 'Untitled page', 60)
  const description = truncate(seo.description || 'No meta description set. Search engines will generate one from the page content.', 155)
  const path = seo.slug ? `/${[pathPrefix, seo.slug].filter(Boolean).join('/')}` : '/…'

  return (
    <div className="rounded-media border border-border bg-surface p-3.5">
      <p className="mb-2.5 font-mono text-admin-xs uppercase tracking-[0.08em] text-muted">Google result</p>

      <div className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-surface-muted">
          <Globe size={12} className="text-body" aria-hidden="true" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-admin-sm text-ink">Knock Nation Bag</p>
          <p className="truncate text-admin-xs text-body">{baseUrl}{path}</p>
        </div>
      </div>

      <p className="mt-2 text-[18px] leading-[24px] text-[#1a0dab]">{title}</p>
      <p className="mt-1 text-admin leading-[20px] text-body">{description}</p>

      {!seo.index ? (
        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-badge bg-danger/10 px-2 py-1 text-admin-xs font-semibold text-danger">
          <TriangleAlert size={12} aria-hidden="true" /> noindex — excluded from search
        </p>
      ) : null}
    </div>
  )
}

/** Live Open Graph / Twitter card preview. */
export function SocialPreview({ seo, network = 'og' }) {
  const isOg = network === 'og'
  const title = truncate((isOg ? seo.ogTitle : seo.twitterTitle) || seo.title || 'Untitled page', isOg ? 60 : 60)
  const description = truncate(
    (isOg ? seo.ogDescription : seo.twitterDescription) || seo.description || 'No description set.',
    isOg ? 110 : 120,
  )
  const image = (isOg ? seo.ogImage : seo.twitterImage) || seo.ogImage

  return (
    <div className="rounded-media border border-border bg-surface p-3.5">
      <p className="mb-2.5 font-mono text-admin-xs uppercase tracking-[0.08em] text-muted">
        {isOg ? 'Facebook / LinkedIn' : 'X / Twitter'}
      </p>

      <div className="overflow-hidden rounded-badge border border-border">
        <div className="relative aspect-[1.91/1] bg-surface-muted">
          {image ? (
            <Image src={image} alt="" fill sizes="360px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-admin-xs text-muted">
              No image set · 1200 × 630 recommended
            </span>
          )}
        </div>
        <div className="border-t border-border bg-surface-muted px-3 py-2">
          <p className="text-admin-xs uppercase tracking-wide text-muted">knocknationbag.com</p>
          <p className="mt-0.5 line-clamp-1 text-admin-md font-bold text-ink">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-admin-sm leading-[17px] text-body">{description}</p>
        </div>
      </div>
    </div>
  )
}

const LEVEL = {
  error: { icon: CircleAlert, cls: 'text-danger', ring: 'bg-danger/10' },
  warning: { icon: TriangleAlert, cls: 'text-[#8A6D1F]', ring: 'bg-gold/15' },
  pass: { icon: CheckCircle2, cls: 'text-verified-fg', ring: 'bg-verified-bg' },
}

/** Validation checklist with a readiness score. */
export function SeoValidation({ checks }) {
  const score = seoScore(checks)
  const errors = checks.filter((c) => c.level === 'error')
  const warnings = checks.filter((c) => c.level === 'warning')
  const passes = checks.filter((c) => c.level === 'pass')
  const ordered = [...errors, ...warnings, ...passes]

  const tone = score >= 85 ? 'text-verified-fg' : score >= 60 ? 'text-[#8A6D1F]' : 'text-danger'
  const bar = score >= 85 ? 'bg-verified-fg' : score >= 60 ? 'bg-gold' : 'bg-danger'

  return (
    <div className="rounded-media border border-border bg-surface p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-admin-xs uppercase tracking-[0.08em] text-muted">SEO readiness</p>
        <p className={cn('text-admin-title font-extrabold tabular-nums', tone)}>{score}<span className="text-admin-sm font-semibold text-muted">/100</span></p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border" role="img" aria-label={`SEO readiness ${score} out of 100`}>
        <div className={cn('h-full rounded-full transition-[width]', bar)} style={{ width: `${score}%` }} />
      </div>

      <p className="mt-2 text-admin-xs text-muted">
        {errors.length} {errors.length === 1 ? 'error' : 'errors'} · {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'} · {passes.length} passed
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {ordered.map((check) => {
          const { icon: Icon, cls, ring } = LEVEL[check.level]
          return (
            <li key={check.id} className="flex gap-2">
              <span className={cn('mt-0.5 grid size-4 shrink-0 place-items-center rounded-full', ring)}>
                <Icon size={10} strokeWidth={2.5} className={cls} aria-hidden="true" />
              </span>
              <span className="text-admin-sm leading-[17px] text-body">{check.message}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
