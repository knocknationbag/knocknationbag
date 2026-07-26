'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField, { AdminToggle } from '@/components/admin/ui/AdminField'
import { cn } from '@/utils/cn'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'seo', label: 'SEO defaults' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'integrations', label: 'Integrations' },
]

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('general')
  const [flags, setFlags] = useState({
    maintenance: false,
    reviews: true,
    guestCheckout: true,
    autoRedirect: true,
    autoSitemap: true,
    compressUploads: true,
  })
  const flag = (k) => ({ checked: flags[k], onChange: (v) => setFlags((f) => ({ ...f, [k]: v })) })

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Store configuration. Changes apply across the storefront and dashboard."
        actions={<AdminButton variant="primary" size="sm" icon={Save}>Save changes</AdminButton>}
      />

      <div role="tablist" aria-label="Settings sections" className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-3 py-2 text-admin font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold',
              tab === t.id ? 'border-gold text-ink' : 'border-transparent text-body hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <AdminCard title="Store identity">
            <div className="flex flex-col gap-3.5">
              <AdminField id="s-name" label="Store name" defaultValue="Knock Nation Bag" />
              <AdminField id="s-tagline" label="Tagline" defaultValue="Carry Confidence. Designed for Every Journey." />
              <AdminField id="s-email" label="Support email" type="email" defaultValue="care@knocknationbag.com" />
              <AdminField id="s-phone" label="Telephone" defaultValue="+1 (555) 018 4420" />
            </div>
          </AdminCard>

          <AdminCard title="Availability">
            <div className="flex flex-col gap-3.5">
              <AdminToggle id="s-maintenance" label="Maintenance mode" hint="Show a holding page to visitors. The dashboard stays reachable." {...flag('maintenance')} />
              <AdminToggle id="s-reviews" label="Customer reviews" hint="Allow reviews to be submitted on product pages." {...flag('reviews')} />
              <AdminToggle id="s-guest" label="Guest checkout" hint="Let customers order without an account." {...flag('guestCheckout')} />
            </div>
          </AdminCard>
        </div>
      ) : null}

      {tab === 'seo' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <AdminCard title="Global defaults" description="Used when a record leaves its own SEO fields empty.">
            <div className="flex flex-col gap-3.5">
              <AdminField id="s-title-template" label="Title template" hint="%s is replaced by the record title." defaultValue="%s | Knock Nation Bag" />
              <AdminField id="s-default-desc" as="textarea" label="Fallback meta description"
                defaultValue="Premium bags crafted for work, travel, everyday life, and modern lifestyles." />
              <AdminField id="s-og-default" label="Default Open Graph image" defaultValue="/og/default.jpg" />
              <AdminField id="s-base-url" label="Canonical base URL" defaultValue="https://knocknationbag.com" />
            </div>
          </AdminCard>

          <AdminCard title="Automation">
            <div className="flex flex-col gap-3.5">
              <AdminToggle id="s-auto-redirect" label="Auto-create redirects" hint="When a published slug changes, add a 301 automatically." {...flag('autoRedirect')} />
              <AdminToggle id="s-auto-sitemap" label="Regenerate sitemap on publish" hint="Rebuild sitemap.xml whenever content is published." {...flag('autoSitemap')} />
              <AdminToggle id="s-compress" label="Compress uploads" hint="Convert new uploads to WebP and strip metadata." {...flag('compressUploads')} />
            </div>
          </AdminCard>
        </div>
      ) : null}

      {tab === 'commerce' ? (
        <AdminCard title="Currency & tax">
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            <AdminField id="s-currency" as="select" label="Currency" defaultValue="USD">
              <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
            </AdminField>
            <AdminField id="s-tax-rate" label="Default tax rate (%)" type="number" defaultValue="8" />
            <AdminField id="s-price-display" as="select" label="Price display" defaultValue="Tax included">
              <option>Tax included</option><option>Tax excluded</option>
            </AdminField>
            <AdminField id="s-free-ship" label="Free shipping threshold" type="number" defaultValue="150" />
            <AdminField id="s-low-stock" label="Global low-stock threshold" type="number" defaultValue="10" />
          </div>
        </AdminCard>
      ) : null}

      {tab === 'shipping' ? (
        <AdminCard title="Shipping methods" description="Rates shown at checkout.">
          <div className="grid gap-3.5 md:grid-cols-3">
            <AdminField id="s-standard" label="Standard rate" type="number" defaultValue="8" hint="3–5 working days" />
            <AdminField id="s-express" label="Express rate" type="number" defaultValue="18" hint="Next working day" />
            <AdminField id="s-intl" label="International rate" type="number" defaultValue="32" hint="7–12 working days" />
          </div>
        </AdminCard>
      ) : null}

      {tab === 'integrations' ? (
        <AdminCard title="Connected services">
          <div className="flex flex-col gap-3.5">
            <AdminField id="s-supabase" label="Supabase project URL" defaultValue="" placeholder="Set via NEXT_PUBLIC_SUPABASE_URL"
              hint="Read from the environment. Configure in .env.local — see docs/supabase.md." disabled />
            <AdminField id="s-analytics" label="Analytics measurement ID" placeholder="G-XXXXXXXXXX" />
            <AdminField id="s-search-console" label="Search Console verification" placeholder="google-site-verification=…" />
          </div>
        </AdminCard>
      ) : null}
    </>
  )
}
