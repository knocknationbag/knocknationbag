import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import MediaDashboard from '@/components/admin/media/MediaDashboard'
import { mediaItems } from '@/data/media'
import { mediaStats } from '@/lib/admin/media'

export const metadata = { title: 'Media Library' }

export default function AdminMediaPage() {
  const { total, missingAlt } = mediaStats(mediaItems)

  return (
    <>
      <AdminPageHeader
        title="Media Library"
        description={
          missingAlt
            ? `${total} files. ${missingAlt} are missing alt text — fix these to protect image search and accessibility. Every module selects images from here.`
            : `${total} files, all with alt text. Every module selects images from here.`
        }
      />
      <MediaDashboard />
    </>
  )
}
