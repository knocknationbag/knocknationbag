# SEO Standards

> Ecommerce lives or dies on organic search. These standards apply from the first page.

---

## 1. Metadata

Use the App Router Metadata API. **Never** hand-write `<head>` tags or use `next/head`.

### Root — `app/layout.jsx`

```js
export const metadata = {
  metadataBase: new URL('https://knocknationbag.com'),
  title: {
    default: 'Knock Nation Bag — Premium Bags for Work, Travel & Modern Life',
    template: '%s | Knock Nation Bag',
  },
  description:
    'Premium bags crafted for work, travel, everyday life, and modern lifestyles. ' +
    'Meticulously designed for ultimate utility and architectural style.',
  applicationName: 'Knock Nation Bag',
  keywords: ['premium bags', 'leather backpack', 'travel luggage', 'laptop bag', 'messenger bag'],
  authors: [{ name: 'Knock Nation Bag' }],
  openGraph: {
    type: 'website',
    siteName: 'Knock Nation Bag',
    locale: 'en_US',
    url: 'https://knocknationbag.com',
    images: [{ url: '/og/default.jpg', width: 1200, height: 630, alt: 'Knock Nation Bag' }],
  },
  twitter: { card: 'summary_large_image', site: '@knocknationbag' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  alternates: { canonical: '/' },
  icons: { icon: '/logo/favicon.svg', apple: '/logo/apple-touch-icon.png' },
}
```

### Per page

Every route exports its own `metadata` (static) or `generateMetadata` (dynamic).
**A page without metadata does not merge.**

| Page | Title pattern | Canonical |
| --- | --- | --- |
| Home | `Knock Nation Bag — Premium Bags for Work, Travel & Modern Life` | `/` |
| Category | `{Category} Bags` | `/category/{slug}` |
| Product | `{Product Name}` | `/product/{slug}` |
| Search | `Search results for "{q}"` + `robots: { index: false }` | none |
| Cart / Account | `robots: { index: false, follow: false }` | none |

### Rules

- Title ≤ **60 characters** including the template suffix.
- Description **140–160 characters**, unique per page, written for humans, no keyword stuffing.
- Exactly one canonical per page. Paginated listings use `?page=n` with a self-referencing canonical.
- Faceted/filtered URLs are `noindex, follow` unless the facet has genuine search demand.

---

## 2. Structured Data (JSON-LD)

Emit via a `<script type="application/ld+json">` in a Server Component. Never build it client-side.

| Page | Schema types |
| --- | --- |
| All | `Organization`, `WebSite` (with `SearchAction`) |
| Home | + `ItemList` for featured products |
| Category | + `BreadcrumbList`, `ItemList` |
| Product | + `Product` (with `Offer`, `AggregateRating`, `Brand`), `BreadcrumbList` |
| Article/blog | + `Article` |

```jsx
// components/common/JsonLd.jsx  — Server Component
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

**Rules**

1. Structured data must describe what is **visibly on the page**. Never mark up a rating, price or
   review that the user cannot see — that is a manual-action risk.
2. `AggregateRating` requires real review data. Until reviews are real, omit it.
3. Validate every template in Google's Rich Results Test before merge.
4. `Offer.availability` and `Offer.price` must reflect live inventory once a backend exists.

---

## 3. Semantic HTML

Search engines read structure. See [`accessibility.md` §2](./accessibility.md#2-semantics) — the
same rules serve both goals.

- One `<h1>` per page, containing the page's primary keyword naturally.
- `<h2>` per section, in document order, no skipped levels.
- Product grids are `<ul>/<li>`.
- Breadcrumbs are a real `<nav aria-label="Breadcrumb">` with an `<ol>`, mirrored in JSON-LD.
- `<main>`, `<header>`, `<footer>`, `<nav>` — exactly one primary of each.

---

## 4. URLs

| Rule | Example |
| --- | --- |
| Lowercase, hyphenated, no trailing slash | `/product/apex-duffle-pro` |
| Descriptive, not numeric | `/category/backpacks`, never `/c/42` |
| Shallow — max 3 segments | `/category/backpacks/laptop` |
| Slugs are stable and stored in data; renaming requires a 301 | — |
| Query strings only for filters, sort and pagination | `?color=black&sort=price-asc` |
| No IDs, no session tokens, no `.html` | — |

`trailingSlash: false` in `next.config.mjs`. Redirect any legacy URL with a permanent redirect
declared in `next.config.mjs` — never a client-side `router.replace`.

---

## 5. Images

Image search is a real acquisition channel for a bag retailer.

- Descriptive filenames — already enforced by [`assets.md` §2](./assets.md#2-naming-convention).
  `apex-duffle-pro.webp` ranks; `Rectangle9.png` does not.
- Meaningful `alt` on every content image ([`accessibility.md` §4](./accessibility.md#4-images)).
- `next/image` everywhere: automatic AVIF/WebP, correct `srcset`, lazy loading.
- `priority` on the hero only — it is the LCP element.
- Explicit dimensions on everything — CLS is a ranking signal.
- Product images listed in `Product` JSON-LD `image[]` as absolute URLs.
- An image sitemap once the catalogue is real.

---

## 6. Performance (Core Web Vitals)

Budgets. Regressions block release.

| Metric | Target | Owner |
| --- | --- | --- |
| LCP | < 2.0s | Hero image: `priority`, correctly sized, WebP |
| INP | < 200ms | Minimal client JS; Server Components by default |
| CLS | **0** | Fixed dimensions on every image, `next/font` (no FOUT) |
| TTFB | < 400ms | SSG/ISR, edge caching |
| JS bundle (home, first load) | < 120 KB gzipped | No UI framework, `lucide-react` tree-shaken |

Practices:
- Server Components by default; `"use client"` only per [`architecture.md` §3](./architecture.md#3-server-vs-client-components).
- `next/font/google` with `display: 'swap'` and preload — no layout shift, no external font request.
- No third-party script before interactive. Analytics via `next/script` with `strategy="afterInteractive"`.
- Dynamic-import anything below the fold that needs client JS.
- Run Lighthouse on every PR that touches the homepage.

---

## 7. Crawlability

### `app/sitemap.js`

Dynamically generated. Includes home, all category pages, all product pages, and static content
pages. Excludes cart, checkout, account and search. Regenerate on build; move to on-demand
revalidation when the catalogue is dynamic.

### `app/robots.js`

```js
export default function robots() {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cart', '/checkout', '/account', '/search', '/*?*sort=', '/*?*page='],
    }],
    sitemap: 'https://knocknationbag.com/sitemap.xml',
  }
}
```

- Internal links use `next/link` so they are crawlable.
- Never gate primary content behind a click, a tab or an intersection observer.
- Pagination uses real `<a href>` links, not buttons.
- Infinite scroll (if ever added) must be backed by paginated, linkable URLs.

---

## 8. Content

- Every category and product page needs unique descriptive copy. Never publish a page whose only
  text is a product name and a price.
- Product descriptions ≥ 150 words, written for the customer, covering materials, dimensions and use case.
- Section eyebrows and headings already carry natural keywords ("Shop by Category", "New Arrivals",
  "Best Sellers") — keep them.
- Internal linking: every product links to its category; every category links to related categories;
  the footer links to all top-level categories.
- No duplicate content across category and filter URLs — canonicalise to the unfiltered category.

---

## 9. Internationalisation (deferred)

Not in v1, but do not close the door:

- Keep all user-facing copy in `constants/` and `data/`, never hard-coded in JSX. This is the single
  most important thing to get right now.
- Prices are numbers plus a currency code; formatting lives in `utils/formatPrice.js`.
- When i18n lands: `app/[locale]/`, `hreflang` via `alternates.languages`, locale-aware sitemaps.

---

## 10. Pre-Launch Checklist

- [ ] Unique title + description on every indexable page
- [ ] Canonical on every page; noindex on cart/checkout/account/search
- [ ] `Organization` + `WebSite` JSON-LD sitewide; `Product` + `BreadcrumbList` on product pages
- [ ] `sitemap.xml` and `robots.txt` reachable and correct
- [ ] Every image has a descriptive filename and `alt`
- [ ] One `<h1>` per page, clean heading outline
- [ ] Core Web Vitals within budget on mobile
- [ ] No broken internal links; every 404 is intentional
- [ ] `metadataBase` set to the production origin
- [ ] Open Graph and Twitter cards render correctly in a debugger
- [ ] Google Search Console + Bing Webmaster Tools verified, sitemap submitted
