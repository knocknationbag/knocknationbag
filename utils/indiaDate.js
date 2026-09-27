/**
 * Calendar dates in India time, for date inputs and printed documents.
 * Explicit zone so the server and the browser never disagree.
 */
const ISO_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
const LONG = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })

/** timestamptz → "2026-12-31" (the India calendar day), or '' */
export function toIndiaDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : ISO_DATE.format(date)
}

/** timestamptz → "31 Dec 2026" in India time, or '—' */
export function formatIndiaDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : LONG.format(date)
}
