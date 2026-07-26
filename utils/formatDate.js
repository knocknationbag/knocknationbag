/**
 * Date formatting for the dashboard.
 *
 * Always called on the server, with an explicit locale and time zone. Leaving
 * either to the environment means the server and the browser can disagree and
 * React reports a hydration mismatch — and the value silently differs per
 * viewer, which is worse than being wrong consistently.
 */
const FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatAdminDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : FORMAT.format(date)
}
