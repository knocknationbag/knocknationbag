/**
 * Declarative column specs.
 *
 * These are pure functions returning plain, serialisable objects — no JSX and no
 * closures. That matters: module pages are Server Components (so they can export
 * `metadata`), but ListModule is a Client Component, and functions cannot cross
 * that boundary. Passing a `type` string instead of a `render` callback keeps the
 * spec serialisable; DataTable resolves the type to a renderer on the client.
 *
 * Use `render` directly only when both the page and the table are on the same
 * side of the boundary (e.g. the dashboard, which is server-only).
 */

export const text = (key, header, opts = {}) => ({ key, header, ...opts })

export const strong = (key, header, opts = {}) => ({ key, header, type: 'strong', ...opts })

export const mono = (key, header, opts = {}) => ({ key, header, type: 'mono', ...opts })

export const status = (key = 'status', header = 'Status') => ({ key, header, type: 'status' })

export const money = (key, header, opts = {}) => ({ key, header, type: 'money', align: 'right', ...opts })

export const number = (key, header, opts = {}) => ({ key, header, type: 'number', align: 'right', ...opts })

export const seoScore = (key = 'seoScore', header = 'SEO') => ({ key, header, type: 'seoScore', align: 'center' })

export const stockCell = (key = 'stock', header = 'Stock') => ({ key, header, type: 'stock', align: 'right' })

export const titleCell = ({ header = 'Name', hrefBase, imageKey = 'image', slugKey = 'slug', width = '30%' } = {}) => ({
  key: 'title',
  header,
  width,
  type: 'title',
  hrefBase,
  imageKey,
  slugKey,
})

export const rowActions = ({ editHrefBase, viewHrefBase, label = 'record' } = {}) => ({
  key: 'actions',
  header: '',
  align: 'right',
  type: 'actions',
  editHrefBase,
  viewHrefBase,
  label,
})
