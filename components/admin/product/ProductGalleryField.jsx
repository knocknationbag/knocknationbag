'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlus, MoveLeft, MoveRight, X } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminEmptyState from '@/components/admin/ui/AdminEmptyState'
import MediaPicker from '@/components/admin/media/MediaPicker'

/**
 * Gallery images, in order.
 *
 * Reordering is buttons rather than drag-and-drop: order matters (it is the
 * order a storefront shows them in), and a keyboard user has to be able to
 * change it. Drag-only reordering would put that out of reach.
 */
export default function ProductGalleryField({ images = [], onChange }) {
  const [picking, setPicking] = useState(false)

  function add(picked) {
    const incoming = picked.map((item) => item.src)
    // Dedupe: the same file selected twice is one image, not two.
    onChange?.([...images, ...incoming.filter((src) => !images.includes(src))])
  }

  function move(index, delta) {
    const next = [...images]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange?.(next)
  }

  return (
    <AdminCard
      title="Gallery"
      description={images.length ? `${images.length} image${images.length === 1 ? '' : 's'}, shown in this order.` : 'Additional images.'}
      actions={
        <AdminButton size="xs" icon={ImagePlus} onClick={() => setPicking(true)}>
          Add images
        </AdminButton>
      }
    >
      {images.length === 0 ? (
        <AdminEmptyState
          icon={ImagePlus}
          title="No gallery images"
          description="Choose images from the Media Library."
          actionLabel="Add images"
          onAction={() => setPicking(true)}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((src, index) => (
            <li key={src} className="overflow-hidden rounded-media border border-border">
              <span className="relative block aspect-square bg-surface-muted">
                <Image src={src} alt="" fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
              </span>
              <span className="flex items-center justify-between gap-1 border-t border-border px-1.5 py-1">
                <span className="font-mono text-admin-xs text-muted">{index + 1}</span>
                <span className="flex items-center gap-0.5">
                  <AdminButton size="xs" variant="ghost" icon={MoveLeft} iconOnly
                    aria-label={`Move image ${index + 1} earlier`} disabled={index === 0}
                    onClick={() => move(index, -1)} />
                  <AdminButton size="xs" variant="ghost" icon={MoveRight} iconOnly
                    aria-label={`Move image ${index + 1} later`} disabled={index === images.length - 1}
                    onClick={() => move(index, 1)} />
                  <AdminButton size="xs" variant="ghost" icon={X} iconOnly
                    aria-label={`Remove image ${index + 1}`} className="hover:text-danger"
                    onClick={() => onChange?.(images.filter((_, i) => i !== index))} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        onSelect={add}
        multiple
        title="Add gallery images"
      />
    </AdminCard>
  )
}
