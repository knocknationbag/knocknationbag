/**
 * Server Component. docs/seo.md §2 — structured data must describe only what is
 * visibly on the page. AggregateRating is deliberately omitted until reviews are real.
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
