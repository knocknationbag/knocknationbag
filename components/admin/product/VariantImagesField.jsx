'use client'

import Image from 'next/image'
import { MoveLeft, MoveRight, X } from 'lucide-react'

import AdminButton from '@/components/admin/ui/AdminButton'
import ImageUploadField from '@/components/admin/ui/ImageUploadField'

/**
 * Photos for one colour (or other option). The first is the option's main
 * image — used on the product page when the colour is chosen, in the cart and
 * on the order — the rest form its gallery. Empty means the product's own
 * photos are shown. Uploads go to the same Supabase Storage bucket as every
 * other product image; photos already on the product can be reused.
 */
export default function VariantImagesField({ id, label, images = [], productImages = [], onChange }) {
  const add = (incoming) => onChange([...images, ...incoming.filter((src) => src && !images.includes(src))])

  function move(index, delta) {
    const next = [...images]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const reusable = productImages.filter((src) => !images.includes(src))

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-admin-sm font-semibold text-ink">{label}</span>
        <div className="flex flex-wrap items-center gap-2">
          {reusable.length ? (
            <select
              id={`${id}-reuse`}
              aria-label={`Add a product photo to ${label}`}
              value=""
              onChange={(e) => add([e.target.value])}
              className="h-7 rounded-badge border border-border bg-surface px-2 text-admin-xs text-ink focus-visible:outline-2 focus-visible:outline-gold"
            >
              <option value="">Add a product photo…</option>
              {reusable.map((src) => <option key={src} value={src}>Product image {productImages.indexOf(src) + 1}</option>)}
            </select>
          ) : null}
          <ImageUploadField multiple folder="products" label="Upload photos" onAdd={add} />
        </div>
      </div>

      {images.length ? (
        <ul className="flex flex-wrap gap-2">
          {images.map((src, index) => (
            <li key={src} className="w-[92px] overflow-hidden rounded-badge border border-border">
              <span className="relative block aspect-square bg-surface-muted">
                <Image src={src} alt="" fill sizes="92px" className="object-cover" />
                {index === 0 ? <span className="absolute left-1 top-1 rounded-badge bg-ink px-1 text-admin-xs font-semibold text-white">Main</span> : null}
              </span>
              <span className="flex items-center justify-between border-t border-border">
                <AdminButton size="xs" variant="ghost" icon={MoveLeft} iconOnly aria-label={`Move ${label} photo ${index + 1} earlier`}
                  disabled={index === 0} onClick={() => move(index, -1)} />
                <AdminButton size="xs" variant="ghost" icon={MoveRight} iconOnly aria-label={`Move ${label} photo ${index + 1} later`}
                  disabled={index === images.length - 1} onClick={() => move(index, 1)} />
                <AdminButton size="xs" variant="ghost" icon={X} iconOnly aria-label={`Remove ${label} photo ${index + 1}`}
                  className="hover:text-danger" onClick={() => onChange(images.filter((s) => s !== src))} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-admin-xs text-muted">No photos for this option — the product&apos;s photos are shown.</p>
      )}
    </div>
  )
}
