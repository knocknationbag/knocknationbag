'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { CATALOG_TAG } from '@/lib/supabase/public'
import { requireDashboardUser } from '@/lib/auth/session'
import { friendlyDbError } from '@/lib/db/errors'
import { slugify } from '@/lib/admin/seo'

/**
 * Category CRUD. Same rules as products: re-check the session, let RLS
 * re-check the role, expire the storefront cache on every change.
 */

const CONSTRAINTS = {
  categories_slug_key: 'Another category already uses that URL slug.',
  categories_slug_format: 'The slug must be lowercase words separated by single hyphens.',
  categories_name_check: 'Enter a name up to 80 characters.',
  categories_not_own_parent: 'A category cannot be its own parent.',
  categories_parent_id_fkey: 'This category has subcategories. Move or delete them first.',
}

const fail = (error, fieldErrors = {}, values = {}) => ({ ok: false, error, fieldErrors, values })

function readForm(formData) {
  const text = (key) => String(formData.get(key) ?? '').trim()
  return {
    id: text('id') || null,
    name: text('name'),
    slug: slugify(text('slug') || text('name')),
    parentId: text('parentId') || null,
    description: text('description'),
    imageUrl: text('imageUrl'),
    status: text('status') === 'Hidden' ? 'Hidden' : 'Active',
    sortOrder: Number.parseInt(text('sortOrder'), 10) || 0,
    seoTitle: text('seoTitle'),
    metaDescription: text('metaDescription'),
    ogImage: text('ogImage'),
  }
}

function refresh(id) {
  updateTag(CATALOG_TAG)
  revalidatePath('/admin/categories')
  if (id) revalidatePath(`/admin/categories/${id}`)
}

export async function saveCategory(_prevState, formData) {
  await requireDashboardUser()

  const category = readForm(formData)
  const fieldErrors = {}
  if (!category.name) fieldErrors.name = 'Enter a category name.'
  else if (category.name.length > 80) fieldErrors.name = 'Keep the name under 80 characters.'
  if (!category.slug) fieldErrors.slug = 'Enter a slug.'
  if (category.parentId && category.parentId === category.id) fieldErrors.parentId = 'A category cannot be its own parent.'
  if (Object.keys(fieldErrors).length) return fail('Check the highlighted fields.', fieldErrors, category)

  const row = {
    name: category.name,
    slug: category.slug,
    parent_id: category.parentId,
    description: category.description || null,
    image_url: category.imageUrl || null,
    status: category.status,
    sort_order: category.sortOrder,
    seo_title: category.seoTitle || null,
    meta_description: category.metaDescription || null,
    og_image: category.ogImage || null,
  }

  const supabase = await createClient()
  const result = category.id
    ? await supabase.from('categories').update(row).eq('id', category.id).select('id').single()
    : await supabase.from('categories').insert(row).select('id').single()

  if (result.error) {
    // The depth trigger raises a readable message of its own.
    const message = result.error.code === '23514' && result.error.message?.includes('subcategor')
      ? result.error.message
      : friendlyDbError(result.error, CONSTRAINTS)
    return fail(message, {}, category)
  }

  refresh(result.data.id)
  return { ok: true, id: result.data.id, created: !category.id }
}

export async function deleteCategory(_prevState, formData) {
  await requireDashboardUser()

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, error: 'Missing category id.' }

  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    return { ok: false, error: error.code === '23503' ? CONSTRAINTS.categories_parent_id_fkey : friendlyDbError(error, CONSTRAINTS) }
  }

  // Products in it are kept; they simply become uncategorised (on delete set null).
  refresh()
  revalidatePath('/admin/products')
  return { ok: true }
}
