'use client'

import { useMemo, useState } from 'react'
import { Wand2 } from 'lucide-react'

import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminCard from '@/components/admin/ui/AdminCard'
import { GooglePreview, SeoValidation, SocialPreview } from './SeoPreviews'
import { MediaPickerField } from '@/components/admin/media/MediaPicker'
import { ROBOTS_PRESETS, SCHEMA_TYPES, SEO_LIMITS, autoCanonical, emptySeo, seoScore, slugify, validateSeo } from '@/lib/admin/seo'
import { cn } from '@/utils/cn'

const TABS = [
  { id: 'search', label: 'Search' },
  { id: 'social', label: 'Social' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'image', label: 'Image SEO' },
]

/**
 * The complete SEO editor. Used by products, categories, collections, CMS pages
 * and blog posts — one component, so a new content type gets the full field set,
 * counters, previews and validation for free.
 *
 * Fields are grouped into tabs on the left; previews and validation stay pinned
 * on the right so the effect of every keystroke is visible immediately.
 */
export default function SeoPanel({ value, onChange, sourceTitle = '', jsonLd = null, pathPrefix = 'product', className }) {
  const [tab, setTab] = useState('search')
  // Memoised so the object identity is stable — otherwise the validation useMemo
  // below re-runs on every keystroke of any unrelated field.
  const seo = useMemo(() => ({ ...emptySeo(), ...value }), [value])

  const set = (patch) => onChange?.({ ...seo, ...patch })
  const field = (key) => ({ value: seo[key] ?? '', onChange: (e) => set({ [key]: e.target.value }) })

  const checks = useMemo(() => validateSeo(seo, { pathPrefix }), [seo, pathPrefix])
  const score = useMemo(() => seoScore(checks), [checks])

  /** Fill empty SEO fields from the record's own title. Never overwrites input. */
  function autofill() {
    set({
      title: seo.title || sourceTitle,
      slug: seo.slug || slugify(sourceTitle),
      ogTitle: seo.ogTitle || seo.title || sourceTitle,
      twitterTitle: seo.twitterTitle || seo.title || sourceTitle,
      ogDescription: seo.ogDescription || seo.description,
      twitterDescription: seo.twitterDescription || seo.description,
      breadcrumbTitle: seo.breadcrumbTitle || sourceTitle,
    })
  }

  return (
    <div className={cn('grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]', className)}>
      <AdminCard
        title="Search engine optimisation"
        description="Every content type carries the same SEO fields."
        padded={false}
        actions={
          <AdminButton size="xs" icon={Wand2} onClick={autofill} disabled={!sourceTitle}>
            Autofill
          </AdminButton>
        }
      >
        <div role="tablist" aria-label="SEO field groups" className="flex gap-1 border-b border-border px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 px-2.5 py-2 text-admin font-semibold transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
                tab === t.id ? 'border-gold text-ink' : 'border-transparent text-body hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'search' ? (
            <div className="flex flex-col gap-3.5">
              <AdminField id="seo-title" label="SEO title" required counter={SEO_LIMITS.title}
                placeholder="Apex Duffle Pro — Full-Grain Leather Weekender" {...field('title')} />
              <AdminField id="seo-description" as="textarea" label="Meta description" required counter={SEO_LIMITS.description}
                placeholder="A structured 45-litre weekender that clears a carry-on gate…" {...field('description')} />

              <div className="grid gap-3.5 md:grid-cols-2">
                <AdminField id="seo-slug" label="Slug" required hint="Lowercase, hyphen-separated."
                  placeholder="apex-duffle-pro" value={seo.slug}
                  onChange={(e) => set({ slug: slugify(e.target.value) })} />
                <AdminField id="seo-keyword" label="Focus keyword" hint="Checked against title, description and slug."
                  placeholder="leather weekender bag" {...field('focusKeyword')} />
              </div>

              <AdminField id="seo-keywords" label="Meta keywords" counter={SEO_LIMITS.keywords}
                hint="Comma-separated. Google ignores these; Bing and site search do not."
                placeholder="leather weekender, carry-on duffle, travel bag" {...field('keywords')} />

              <AdminField id="seo-breadcrumb" label="Breadcrumb title" counter={SEO_LIMITS.breadcrumbTitle}
                hint="Shorter label used in breadcrumb trails and BreadcrumbList markup."
                placeholder="Apex Duffle" {...field('breadcrumbTitle')} />
            </div>
          ) : null}

          {tab === 'social' ? (
            <div className="flex flex-col gap-3.5">
              <AdminField id="og-title" label="Open Graph title" counter={SEO_LIMITS.ogTitle}
                hint="Falls back to the SEO title when empty." {...field('ogTitle')} />
              <AdminField id="og-description" as="textarea" label="Open Graph description" counter={SEO_LIMITS.ogDescription}
                {...field('ogDescription')} />
              <MediaPickerField
                id="og-image" label="Open Graph image" hint="1200 × 630 recommended."
                value={seo.ogImage} onChange={(src) => set({ ogImage: src })}
              />

              <hr className="border-border" />

              <AdminField id="tw-title" label="Twitter title" counter={SEO_LIMITS.twitterTitle}
                hint="Falls back to the Open Graph title." {...field('twitterTitle')} />
              <AdminField id="tw-description" as="textarea" label="Twitter description" counter={SEO_LIMITS.twitterDescription}
                {...field('twitterDescription')} />
              <MediaPickerField
                id="tw-image" label="Twitter image" hint="Falls back to the Open Graph image."
                value={seo.twitterImage} onChange={(src) => set({ twitterImage: src })}
              />
            </div>
          ) : null}

          {tab === 'advanced' ? (
            <div className="flex flex-col gap-3.5">
              <AdminField id="seo-canonical" label="Canonical URL"
                hint={seo.canonical ? 'Absolute URL.' : `Empty means this generated URL is used: ${autoCanonical(seo.slug, undefined, pathPrefix) || '—'}`}
                placeholder={autoCanonical(seo.slug, undefined, pathPrefix) || 'https://knocknationbag.com/product/apex-duffle-pro'}
                {...field('canonical')} />

              <div className="grid gap-3.5 md:grid-cols-2">
                <AdminField id="seo-robots" as="select" label="Robots directive" value={seo.robots}
                  onChange={(e) => {
                    const v = e.target.value
                    set({ robots: v, index: v.startsWith('index'), follow: v.includes(' follow') })
                  }}>
                  {ROBOTS_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
                </AdminField>

                <AdminField id="seo-schema" as="select" label="Schema type" {...field('schemaType')}>
                  {SCHEMA_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </AdminField>
              </div>

              <div className="grid gap-3 rounded-badge border border-border bg-surface-muted p-3 md:grid-cols-2">
                <AdminToggle id="seo-index" label="Index" hint="Allow this page in search results."
                  checked={seo.index}
                  onChange={(v) => set({ index: v, robots: `${v ? 'index' : 'noindex'}, ${seo.follow ? 'follow' : 'nofollow'}` })} />
                <AdminToggle id="seo-follow" label="Follow" hint="Allow crawlers to follow its links."
                  checked={seo.follow}
                  onChange={(v) => set({ follow: v, robots: `${seo.index ? 'index' : 'noindex'}, ${v ? 'follow' : 'nofollow'}` })} />
              </div>

              <AdminField id="seo-structured" as="textarea" rows={5} label="Structured data (JSON-LD)"
                hint="Validated as JSON. Leave empty to use the generated default for the schema type."
                placeholder='{ "@context": "https://schema.org", "@type": "Product" }'
                {...field('structuredData')} />

              <div className="grid gap-3.5 md:grid-cols-[minmax(0,1fr)_120px]">
                <AdminField id="seo-redirect" label="Redirect from"
                  hint="Old path to redirect to this record. Managed in Redirects."
                  placeholder="/old-product-url" {...field('redirectFrom')} />
                <AdminField id="seo-redirect-type" as="select" label="Type" {...field('redirectType')}>
                  <option value="301">301</option>
                  <option value="302">302</option>
                  <option value="410">410</option>
                </AdminField>
              </div>
            </div>
          ) : null}

          {tab === 'image' ? (
            <div className="flex flex-col gap-3.5">
              <AdminField id="img-alt" label="Alt text" required counter={SEO_LIMITS.altText}
                hint="Describes the image for screen readers and image search."
                placeholder="Apex Duffle Pro dark leather weekender on a stone plinth" {...field('altText')} />
              <AdminField id="img-title" label="Image title" hint="Tooltip text on hover." {...field('imageTitle')} />
              <AdminField id="img-caption" label="Image caption" hint="Shown beneath the image where the template supports it." {...field('imageCaption')} />
              <AdminField id="img-description" as="textarea" label="Image description"
                hint="Longer description stored with the media record." {...field('imageDescription')} />
            </div>
          ) : null}
        </div>
      </AdminCard>

      <div className="flex flex-col gap-3">
        <AdminCard title="SEO score" description="Errors cost more than warnings.">
          <div className="flex items-center gap-3">
            <span className={cn(
              'grid size-12 shrink-0 place-items-center rounded-full text-admin-lg font-extrabold tabular-nums',
              score >= 85 ? 'bg-verified-bg text-verified-fg' : score >= 70 ? 'bg-gold/15 text-[#8A6D1F]' : 'bg-danger/10 text-danger',
            )}>
              {score}
            </span>
            <p className="text-admin-sm leading-[18px] text-body">
              {score >= 85 ? 'Ready to publish.' : score >= 70 ? 'Publishable, but there is room to improve.' : 'Needs attention before publishing.'}
            </p>
          </div>
        </AdminCard>

        <SeoValidation checks={checks} />
        <GooglePreview seo={seo} pathPrefix={pathPrefix} />
        <SocialPreview seo={seo} network="og" />
        <SocialPreview seo={seo} network="twitter" />

        {jsonLd ? (
          <AdminCard title="Product schema (JSON-LD)" description="Generated from the record, so it can never contradict the page.">
            <pre className="max-h-[260px] overflow-auto rounded-badge bg-surface-muted p-2.5 font-mono text-admin-xs leading-[16px] text-body">
              {JSON.stringify(jsonLd, null, 2)}
            </pre>
          </AdminCard>
        ) : null}
      </div>
    </div>
  )
}
