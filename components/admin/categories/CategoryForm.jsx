'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save } from 'lucide-react'

import AdminCard from '@/components/admin/ui/AdminCard'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminField from '@/components/admin/ui/AdminField'
import ImageUploadField from '@/components/admin/ui/ImageUploadField'
import AuthMessage from '@/components/admin/auth/AuthMessage'
import { saveCategory } from '@/lib/actions/categories'
import { slugify } from '@/lib/admin/seo'

const INITIAL = { ok: false, error: null, fieldErrors: {}, values: {} }

/**
 * Create / edit a category. Parent choices are top-level categories only —
 * the catalogue allows one level of subcategories — and a category that
 * already has subcategories cannot itself be moved under another.
 */
export default function CategoryForm({ category = null, parents = [], hasChildren = false }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(saveCategory, INITIAL)
  const initial = { ...category, ...state.values }
  const errors = state.fieldErrors ?? {}

  const [name, setName] = useState(initial.name ?? '')
  const [slug, setSlug] = useState(initial.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? '')
  const [ogImage, setOgImage] = useState(initial.ogImage ?? '')

  useEffect(() => {
    if (state.ok && state.created) router.replace(`/admin/categories/${state.id}`)
  }, [state, router])

  const parentChoices = parents.filter((p) => p.id !== category?.id)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={category?.id ?? ''} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="ogImage" value={ogImage} />

      {state.error ? <AuthMessage tone="error">{state.error}</AuthMessage> : null}
      {state.ok && !state.created ? <AuthMessage tone="success">Changes saved.</AuthMessage> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AdminCard title="Category">
          <div className="flex flex-col gap-3.5">
            <div className="grid gap-3.5 md:grid-cols-2">
              <AdminField id="name" name="name" label="Name" required value={name} error={errors.name}
                placeholder="Laptop Bags"
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slugTouched) setSlug(slugify(e.target.value))
                }} />
              <AdminField id="slug" name="slug" label="URL slug" required value={slug} error={errors.slug}
                hint={slug ? `/category/${slug}` : 'Generated from the name.'}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} />
            </div>

            <AdminField id="parentId" name="parentId" as="select" label="Parent category"
              defaultValue={initial.parentId ?? ''} error={errors.parentId} disabled={hasChildren}
              hint={hasChildren ? 'This category has subcategories, so it stays top-level.' : 'Leave empty for a main category. Choose one to make this a subcategory.'}>
              <option value="">None — main category</option>
              {parentChoices.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </AdminField>

            <AdminField id="description" name="description" as="textarea" rows={3} label="Description"
              defaultValue={initial.description ?? ''} hint="Shown at the top of the category page." />
          </div>
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard title="Visibility">
            <div className="flex flex-col gap-3.5">
              <AdminField id="status" name="status" as="select" label="Status" defaultValue={initial.status ?? 'Active'}
                hint="Hidden categories do not appear in the shop.">
                <option value="Active">Active</option>
                <option value="Hidden">Hidden</option>
              </AdminField>
              <AdminField id="sortOrder" name="sortOrder" type="number" step="1" label="Display order"
                defaultValue={initial.sortOrder ?? 0} hint="Lower numbers appear first." />
            </div>
          </AdminCard>

          <AdminCard title="Image">
            <ImageUploadField folder="categories" value={imageUrl} onChange={setImageUrl}
              hint="Optional. Without one, the category shows a photo of one of its products." />
          </AdminCard>
        </div>
      </div>

      <AdminCard title="Search engines" description="Optional. Sensible defaults are used when left empty.">
        <div className="grid gap-3.5 md:grid-cols-2">
          <AdminField id="seoTitle" name="seoTitle" label="SEO title" defaultValue={initial.seoTitle ?? ''}
            placeholder={name ? `${name} | Knock Nation Bag` : ''} counter={{ ideal: 60, max: 70 }} />
          <AdminField id="metaDescription" name="metaDescription" as="textarea" rows={2} label="Meta description"
            defaultValue={initial.metaDescription ?? ''} counter={{ ideal: 155, max: 160 }} />
          <ImageUploadField folder="categories" label="Social share image" value={ogImage} onChange={setOgImage}
            hint="Used when the page is shared. Defaults to the category image." />
        </div>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton type="submit" variant="primary" size="md" icon={Save} disabled={pending}>
          {pending ? 'Saving…' : category ? 'Save changes' : 'Create category'}
        </AdminButton>
        <Link href="/admin/categories"
          className="text-admin-sm font-medium text-body underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
          Cancel
        </Link>
      </div>
    </form>
  )
}
