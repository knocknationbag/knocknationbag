'use client'

import { useId, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { ImagePlus, RefreshCw, X } from 'lucide-react'

import AdminButton from './AdminButton'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { uploadCatalogImage } from '@/lib/actions/uploads'
import { cn } from '@/utils/cn'

/**
 * Upload control for catalogue images.
 *
 * Single mode (`onChange(url)`): one image with Replace / Remove — featured
 * image, category image. Multiple mode (`onAdd(urls)`): a button that uploads
 * several files and reports their URLs — the product gallery. Files go to
 * Supabase Storage through a Server Action; the form only ever stores the
 * resulting URL.
 */
export default function ImageUploadField({
  label,
  hint = 'JPG, PNG, WebP or AVIF, up to 5 MB. Square images at least 1200 px look best.',
  value = '',
  onChange,
  onAdd,
  multiple = false,
  folder = 'products',
  className,
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  function upload(fileList) {
    const files = [...(fileList ?? [])]
    if (!files.length) return
    setError(null)

    startTransition(async () => {
      const urls = []
      for (const file of files) {
        const data = new FormData()
        data.set('file', file)
        data.set('folder', folder)
        const result = await uploadCatalogImage(data)
        if (!result.ok) {
          setError(`${file.name}: ${result.error}`)
          break
        }
        urls.push(result.url)
      }
      if (urls.length) {
        if (multiple) onAdd?.(urls)
        else onChange?.(urls[0])
      }
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  const picker = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      multiple={multiple}
      className="sr-only"
      onChange={(event) => upload(event.target.files)}
    />
  )

  if (multiple) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {picker}
        <AdminButton size="xs" icon={ImagePlus} disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? 'Uploading…' : label ?? 'Upload images'}
        </AdminButton>
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? <span className="text-admin-sm font-semibold text-ink">{label}</span> : null}
      {picker}

      <div className="flex flex-wrap items-center gap-3">
        <span className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-media border border-border bg-surface-muted">
          {value ? (
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <ImagePlus size={22} className="text-muted" aria-hidden="true" />
          )}
        </span>

        <div className="flex flex-wrap gap-2">
          <AdminButton size="sm" icon={value ? RefreshCw : ImagePlus} disabled={pending} onClick={() => inputRef.current?.click()}>
            {pending ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
          </AdminButton>
          {value ? (
            <AdminButton size="sm" variant="ghost" icon={X} disabled={pending} onClick={() => onChange?.('')}>
              Remove
            </AdminButton>
          ) : null}
        </div>
      </div>

      {error ? <AuthMessage tone="error">{error}</AuthMessage> : <p className="text-admin-xs text-muted">{hint}</p>}
    </div>
  )
}
