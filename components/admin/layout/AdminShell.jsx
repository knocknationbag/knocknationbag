'use client'

import { useState } from 'react'

import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

/**
 * Dashboard frame. Owns only the two pieces of chrome state — drawer open and
 * sidebar collapsed — so every page below stays a Server Component.
 *
 * Layout: sidebar is `sticky` and the content column scrolls with the document,
 * which keeps native page scrolling (and browser find-in-page) working. A nested
 * overflow container would break both.
 *
 * `user` comes from the session, resolved in the (shell) layout. The sidebar
 * filters itself by the role it carries, so what is navigable follows the role
 * rather than being hard-coded here.
 */
export default function AdminShell({ user, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const role = user?.roleId ?? null

  return (
    <div className="flex min-h-svh bg-surface-muted">
      <AdminSidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        role={role}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenSidebar={() => setDrawerOpen(true)} user={user} />
        <main id="admin-main" className="min-w-0 flex-1 px-3 py-4 md:px-4 md:py-5 xl:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
