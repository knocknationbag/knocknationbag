'use server'

import crypto from 'node:crypto'

import { createClient } from '@/lib/supabase/server'
import { requireDashboardUser } from '@/lib/auth/session'

/**
 * Uploads one product or category image to the public `catalog` bucket.
 *
 * Runs as the signed-in admin through the session client, so the storage RLS
 * policies (admin-only insert) are what authorise the write — this action
 * cannot be used to upload anything by a customer even if the check below were
 * removed. Files get random names: a guessable name would let one upload
 * overwrite another, and the original filename can leak information.
 */

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
const MAX_BYTES = 5 * 1024 * 1024
const FOLDERS = ['products', 'categories']

export async function uploadCatalogImage(formData) {
  await requireDashboardUser()

  const file = formData.get('file')
  const folder = String(formData.get('folder') ?? 'products')

  if (!FOLDERS.includes(folder)) return { ok: false, error: 'Unknown upload folder.' }
  if (!file || typeof file === 'string' || !file.size) return { ok: false, error: 'Choose an image to upload.' }
  if (!TYPES[file.type]) return { ok: false, error: 'Use a JPG, PNG, WebP or AVIF image.' }
  if (file.size > MAX_BYTES) return { ok: false, error: 'Images must be 5 MB or smaller.' }

  const now = new Date()
  const path = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${TYPES[file.type]}`

  const supabase = await createClient()
  const { error } = await supabase.storage.from('catalog').upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) {
    return { ok: false, error: error.message?.includes('row-level security') ? 'Your account cannot upload images.' : 'The upload failed. Please try again.' }
  }

  const { data } = supabase.storage.from('catalog').getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}
