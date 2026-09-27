export const metadata = {
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Printable documents for customers. No storefront header, footer or mobile
 * nav — only the document and a screen-only toolbar — so the browser prints
 * the bill and nothing else. Admin print screens have their own group under
 * app/(admin)/admin/(print).
 */
export default function PrintLayout({ children }) {
  return <main className="min-h-svh bg-surface-muted pb-10 print:bg-surface print:pb-0">{children}</main>
}
