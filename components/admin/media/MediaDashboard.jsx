'use client'

import { useState } from 'react'
import { HardDrive, ImageOff, Images, Trash2 } from 'lucide-react'

import StatCard from '@/components/admin/ui/StatCard'
import MediaBrowser from './MediaBrowser'
import { formatBytes, mediaStats } from '@/lib/admin/media'
import { mediaItems } from '@/data/media'

/**
 * /admin/media. Holds the library state so edits, renames and deletions made in
 * the details drawer are reflected in the stats above without a reload.
 */
export default function MediaDashboard() {
  const [items, setItems] = useState(mediaItems)
  const stats = mediaStats(items)

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Files" value={String(stats.total)} hint={`across ${stats.folders} folders`} icon={Images} />
        <StatCard label="Storage used" value={formatBytes(stats.totalBytes)} hint="optimised WebP" icon={HardDrive} />
        <StatCard label="Missing alt text" value={String(stats.missingAlt)} hint="SEO and accessibility" icon={ImageOff} />
        <StatCard label="Unused files" value={String(stats.unused)} hint={`${formatBytes(stats.unusedBytes)} reclaimable`} icon={Trash2} />
      </div>

      <MediaBrowser items={items} onItemsChange={setItems} mode="manage" />
    </>
  )
}
