import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { dbResult, friendlyDbError } from './errors'

/**
 * Category data access for the dashboard. Admin RLS sees Hidden categories
 * too; the storefront reads through lib/catalog (Active only).
 */

export function toCategory(row) {
  return {
    id: row.id,
    parentId: row.parent_id ?? '',
    name: row.name ?? '',
    slug: row.slug ?? '',
    description: row.description ?? '',
    imageUrl: row.image_url ?? '',
    status: row.status ?? 'Active',
    sortOrder: row.sort_order ?? 0,
    seoTitle: row.seo_title ?? '',
    metaDescription: row.meta_description ?? '',
    ogImage: row.og_image ?? '',
    productCount: row.products?.[0]?.count ?? 0,
    createdAt: row.created_at,
  }
}

/** Parents first, each followed by its subcategories — the order the list shows. */
function asTree(categories) {
  const byOrder = (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
  const parents = categories.filter((c) => !c.parentId).sort(byOrder)
  const orphans = categories.filter((c) => c.parentId && !categories.some((p) => p.id === c.parentId))
  return [
    ...parents.flatMap((parent) => [
      { ...parent, depth: 0 },
      ...categories.filter((c) => c.parentId === parent.id).sort(byOrder).map((child) => ({ ...child, depth: 1, parentName: parent.name })),
    ]),
    ...orphans.map((c) => ({ ...c, depth: 0 })),
  ]
}

export async function listCategories({ query = '', status = '' } = {}) {
  const supabase = await createClient()
  let request = supabase.from('categories').select('*, products(count)')
  if (status) request = request.eq('status', status)

  const { data, error } = await request
  if (error) return dbResult({ error })

  let rows = asTree((data ?? []).map(toCategory))
  if (query.trim()) {
    const term = query.trim().toLowerCase()
    rows = rows.filter((c) => c.name.toLowerCase().includes(term) || c.slug.includes(term))
  }
  return dbResult({ rows, total: rows.length })
}

/** Lightweight list for the product form's category picker. */
export async function listCategoryOptions() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('id, name, parent_id, sort_order').order('sort_order').order('name')
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, parentId: row.parent_id }))
}

export async function getCategory(id) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*, products(count)').eq('id', id).maybeSingle()
  if (error) return { category: null, error: friendlyDbError(error) }
  return { category: data ? toCategory(data) : null, error: null }
}
