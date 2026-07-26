/**
 * Media Library helpers. Pure functions, so the same filtering and stats can run
 * server-side later without touching the UI.
 */

export const MEDIA_VIEWS = [
  { id: 'all', label: 'All files' },
  { id: 'recent', label: 'Recent uploads' },
  { id: 'unused', label: 'Unused' },
  { id: 'no-alt', label: 'Missing alt text' },
]

export const MEDIA_SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'name', label: 'Filename A–Z' },
  { id: 'largest', label: 'Largest first' },
  { id: 'smallest', label: 'Smallest first' },
]

export function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Uploads are stored as "12 Feb 2025"; parsed once here so sorting is honest. */
function uploadedTime(value) {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

/** Newest 8 by upload date — backs the Recent Uploads view. */
export function recentUploads(items, limit = 8) {
  return [...items].sort((a, b) => uploadedTime(b.uploaded) - uploadedTime(a.uploaded)).slice(0, limit)
}

export const isUnused = (item) => !item.usedIn?.length
export const isMissingAlt = (item) => !item.alt?.trim()

export function filterMedia(items, { view = 'all', folder = '', type = '', query = '' } = {}) {
  const q = query.trim().toLowerCase()
  const recentIds = new Set(recentUploads(items).map((i) => i.id))

  return items.filter((item) => {
    if (folder && item.folder !== folder) return false
    if (type && item.type !== type) return false
    if (view === 'unused' && !isUnused(item)) return false
    if (view === 'no-alt' && !isMissingAlt(item)) return false
    if (view === 'recent' && !recentIds.has(item.id)) return false
    if (q && ![item.filename, item.alt, item.title, item.folder].join(' ').toLowerCase().includes(q)) return false
    return true
  })
}

export function sortMedia(items, sort = 'newest') {
  const list = [...items]
  switch (sort) {
    case 'oldest': return list.sort((a, b) => uploadedTime(a.uploaded) - uploadedTime(b.uploaded))
    case 'name': return list.sort((a, b) => a.filename.localeCompare(b.filename))
    case 'largest': return list.sort((a, b) => b.bytes - a.bytes)
    case 'smallest': return list.sort((a, b) => a.bytes - b.bytes)
    default: return list.sort((a, b) => uploadedTime(b.uploaded) - uploadedTime(a.uploaded))
  }
}

export function mediaStats(items) {
  const unused = items.filter(isUnused)
  return {
    total: items.length,
    totalBytes: items.reduce((n, i) => n + i.bytes, 0),
    unused: unused.length,
    unusedBytes: unused.reduce((n, i) => n + i.bytes, 0),
    missingAlt: items.filter(isMissingAlt).length,
    folders: new Set(items.map((i) => i.folder)).size,
  }
}

export function folderCounts(items) {
  return items.reduce((acc, item) => {
    acc[item.folder] = (acc[item.folder] ?? 0) + 1
    return acc
  }, {})
}

/** Rename keeps the original extension — a renamed .webp must stay a .webp. */
export function renameFile(filename, nextBase) {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : ''
  const base = nextBase.trim().replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-')
  return `${base || 'untitled'}${ext}`
}
