'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import StatusBadge from '@/components/admin/ui/StatusBadge'
import { GooglePreview, SocialPreview } from '@/components/admin/seo/SeoPreviews'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '390px' },
]

/**
 * Storefront preview for an unpublished or edited product, plus how it will
 * appear in search and on social.
 *
 * Renders an approximation rather than embedding the live route: a draft product
 * has no public URL to load, which is exactly when preview matters most.
 */
export default function ProductPreview({ product, seo }) {
  const [device, setDevice] = useState('desktop')
  const active = DEVICES.find((d) => d.id === device)
  const isLive = product.status === 'Published'

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <AdminCard
        title="Storefront preview"
        description="An approximation of the product page. Draft products have no public URL."
        padded={false}
        actions={
          <>
            <div role="group" aria-label="Preview width" className="flex rounded-badge border border-border p-0.5">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  aria-pressed={device === d.id}
                  aria-label={d.label}
                  className={cn(
                    'grid size-6 place-items-center rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold',
                    device === d.id ? 'bg-ink text-white' : 'text-body hover:text-ink',
                  )}
                >
                  <d.icon size={12} aria-hidden="true" />
                </button>
              ))}
            </div>
            {isLive ? (
              <AdminButton size="xs" icon={ExternalLink} href={`/product/${product.slug}`}>Open live</AdminButton>
            ) : null}
          </>
        }
      >
        <div className="bg-surface-muted p-4">
          <div
            className="mx-auto overflow-hidden rounded-media border border-border bg-surface transition-[max-width]"
            style={{ maxWidth: active.width }}
          >
            <div className={cn('grid gap-4 p-4', device === 'desktop' && 'md:grid-cols-2 md:gap-6')}>
              <div className="relative aspect-square overflow-hidden rounded-media bg-surface-muted">
                {product.image ? (
                  <Image src={product.image} alt={seo.altText || product.imageAlt || ''} fill sizes="420px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-admin-sm text-muted">No image</span>
                )}
              </div>

              <div>
                <p className="font-mono text-admin-xs uppercase tracking-[0.1em] text-gold">{product.brand}</p>
                <h2 className={cn('mt-1.5 font-extrabold tracking-tight text-ink', device === 'mobile' ? 'text-[20px]' : 'text-[26px]')}>
                  {product.title || 'Untitled product'}
                </h2>

                <p className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-[20px] font-bold text-ink">{formatPrice(Number(product.price) || 0)}</span>
                  {product.oldPrice ? <s className="text-admin-md text-muted">{formatPrice(Number(product.oldPrice))}</s> : null}
                </p>

                <p className="mt-3 text-admin-md leading-[20px] text-body">
                  {product.shortDescription || 'No short description set.'}
                </p>

                <div className="mt-4 flex gap-2">
                  <span className="grid h-9 flex-1 place-items-center rounded-full bg-gold text-admin-md font-semibold text-ink">
                    Add to Cart
                  </span>
                  <span className="grid size-9 place-items-center rounded-full border border-border text-body" aria-hidden="true">♡</span>
                </div>

                {product.specs?.filter((s) => s.key).length ? (
                  <dl className="mt-4 border-t border-border pt-3 text-admin-sm">
                    {product.specs.filter((s) => s.key).slice(0, 4).map((s) => (
                      <div key={s.id} className="flex justify-between gap-3 border-b border-border py-1.5 last:border-0">
                        <dt className="text-muted">{s.key}</dt>
                        <dd className="font-medium text-ink">{s.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-admin-xs text-muted">
            {active.label} · {active.width === '100%' ? 'full width' : active.width}
          </p>
        </div>
      </AdminCard>

      <div className="flex flex-col gap-3">
        <AdminCard title="Publication">
          <dl className="flex flex-col gap-2 text-admin-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Status</dt><dd><StatusBadge status={product.status} /></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Indexable</dt><dd><StatusBadge status={seo.index ? 'Index' : 'NoIndex'} /></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Public URL</dt>
              <dd className="font-mono text-admin-xs text-ink">{isLive ? `/product/${product.slug}` : 'Not live'}</dd>
            </div>
          </dl>
        </AdminCard>

        <GooglePreview seo={seo} />
        <SocialPreview seo={seo} network="og" />
      </div>
    </div>
  )
}
