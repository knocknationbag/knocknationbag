# CLAUDE.md — Working Rules for This Codebase

> Instructions for any AI agent or developer writing code in this repository.
> **Read this file, then [`design.md`](./design.md), before writing a single line.**
> When this file and your instinct disagree, this file wins. When this file is silent, ask.

---

## 1. Project Overview

**Knock Nation Bag** — a production ecommerce frontend for a premium bag brand.

| | |
| --- | --- |
| Framework | Next.js, App Router |
| Language | **JavaScript only.** No TypeScript, no `.ts`, no `.tsx`, no JSDoc-as-types ceremony |
| UI | React, Server Components by default |
| Styling | **Tailwind CSS utilities only** |
| Icons | `lucide-react` |
| Fonts | `next/font/google` — Outfit (primary), Geist Mono (annotation) |
| Current phase | Phase 1 — Home landing page |

Only the home landing page is designed. It must be recreated **exactly** from
`reference/ui-ux/knb-{desktop,tablet,mobile}-homepage.png`. No redesign, no creative liberties,
no "improvements" to layout, colour, spacing or type. Improve the *code*, never the *design*.

### Hard prohibitions

TypeScript · Bootstrap · Material UI · Chakra · Ant Design · styled-components · Emotion · Sass ·
CSS Modules · any `.css` file other than `app/globals.css` · inline `style={{}}` (unless the value
is computed at runtime) · any second icon library · any CSS-in-JS.

---

## 2. Documentation Map

| File | Read it when |
| --- | --- |
| **[design.md](./design.md)** | Any visual decision. Colours, type, spacing, grid, components, animation. **The single source of truth.** |
| [architecture.md](./architecture.md) | Adding a file, deciding server vs client, wiring data |
| [components.md](./components.md) | Building or using any component. Full prop contracts |
| [assets.md](./assets.md) | Adding or referencing an image, icon or logo |
| [responsive.md](./responsive.md) | Anything breakpoint-related |
| [accessibility.md](./accessibility.md) | Every PR. Non-negotiable |
| [seo.md](./seo.md) | Adding a route or metadata |
| [roadmap.md](./roadmap.md) | Understanding where a feature belongs |

---

## 3. The Five Rules That Matter Most

1. **Never duplicate a component.** If a card, button, heading or badge appears twice, it is one
   component with props. `Featured Collection` and `Best Sellers` are the *same* `ProductSection`.
2. **Content is identical at every breakpoint.** Only layout changes. Never hide, drop, truncate or
   rename content responsively. See [`responsive.md`](./responsive.md).
3. **Never hard-code a design value.** No raw hex, no `text-[19px]`, no `mt-[37px]`. Tokens only.
   Missing token? Add it to the `@theme` block in `app/globals.css` first.
4. **Server Components by default.** `"use client"` only for state, events, browser APIs or context —
   and push it to the smallest possible leaf.
5. **Recreate the design exactly.** Pixel-perfect. The measured geometry is in
   [`design.md` §6](./design.md#6-grid--container).

---

## 4. Folder Structure

Full tree and decision rules: [`architecture.md` §2](./architecture.md#2-folder-structure).

```
app/  components/{common,layout,home,product,ui}/  constants/  data/
hooks/  lib/  utils/  public/  docs/
```

Where does a new file go?

```
route?                       -> app/
page chrome?                 -> components/layout/
homepage-only?               -> components/home/
commerce concept?            -> components/product/
styling-free primitive?      -> components/ui/
used by 3+ unrelated places? -> components/common/
pure function?               -> utils/
external integration?        -> lib/
React state/effects?         -> hooks/
future CMS content?          -> data/
never changes?               -> constants/
```

**Promotion rule:** a component starts in the most specific folder that fits. The moment a second
unrelated page imports it, move it to `common/` in the same PR.

---

## 5. Naming Conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component file | `PascalCase.jsx` | `ProductCard.jsx` |
| Component | Matches filename, default export | `export default function ProductCard()` |
| Hook file | `useCamelCase.js` | `useMediaQuery.js` |
| Util / lib file | `camelCase.js` | `formatPrice.js` |
| Data / constants file | `camelCase.js`, named exports | `export const products = [...]` |
| Constant value | `SCREAMING_SNAKE_CASE` | `MAX_CART_ITEMS` |
| Boolean prop | `is` / `has` / `show` prefix | `isActive`, `hasBadge`, `showArrow` |
| Handler prop | `onX` | `onToggle`, `onAdd` |
| Internal handler | `handleX` | `handleSubmit` |
| Asset | `kebab-case` | `apex-duffle-pro.webp` |
| CSS custom property | `--kebab-case` | `--radius-card` |
| Route segment | `kebab-case` | `/product/apex-duffle-pro` |

Name by **role**, never by appearance or position: `ProductCard` not `WhiteCard`;
`SectionHeader` not `CenteredTitle`; `PromoBanner` not `BigImageBlock`.

One component per file. **No file over 150 lines** — past that, extract a subcomponent.

---

## 6. Tailwind Rules

### Use tokens, never literals

```jsx
// ✅
<h2 className="text-h2 font-extrabold text-ink">
<div className="bg-surface-muted border border-border rounded-card">

// ❌
<h2 className="text-[42px] font-extrabold text-[#111827]">
<div className="bg-slate-50 border border-slate-200 rounded-[14px]">
```

Never use Tailwind's default palette names (`slate-200`, `gray-900`, `amber-500`) in a component.
Semantic aliases only — a rebrand must be a one-file change.

### Class order

Layout → box model → typography → visual → state → responsive.

```jsx
className="flex items-center gap-4 w-full p-4 text-body text-ink bg-surface
           border border-border rounded-card hover:border-slate-300 md:p-6 xl:gap-6"
```

### Conditional classes

Always through `cn()` (`clsx` + `tailwind-merge`). Never template-literal concatenation.

```jsx
import { cn } from '@/utils/cn'
<div className={cn('rounded-card border', isActive && 'border-gold', className)} />
```

> **Registering new `text-*` tokens.** `tailwind-merge` only knows Tailwind's stock font-size
> scale. An unrecognised `text-*` utility is classified as a text **colour**, so
> `cn('text-white', 'text-btn-sm')` silently drops `text-white` and the element falls back to the
> inherited body colour. Every custom `--text-*` token in `globals.css` must therefore also be
> listed in `FONT_SIZES` in [`utils/cn.js`](../utils/cn.js). **Add the token in both places or the
> bug is invisible until you inspect computed styles.**

### Variants

Plain lookup object at module scope. No CVA dependency.

```jsx
const VARIANTS = {
  primary:   'h-13 px-8 bg-gold text-ink hover:brightness-95',
  secondary: 'h-13 px-8 border-2 border-ink text-ink hover:bg-ink hover:text-white',
}
```

### Arbitrary values

Permitted **only** for geometry that is genuinely one-off and measured from the reference
(`aspect-[39/28]`, `grid-cols-[2fr_1fr_1fr_1fr]`). **Never** for colour, font-size, radius or
spacing — those are tokens.

### `@apply`

Forbidden. If you are reaching for it, you need a component.

### `globals.css`

Contains only: Tailwind directives, the token block, base `body` styles, and the
`prefers-reduced-motion` override. Adding anything else requires a documented reason.

---

## 7. Component Rules

1. **One component per file**, default export, filename matches.
2. **Props are explicit and destructured** in the signature with defaults. No `props.x`.
3. **No component over 150 lines.**
4. **Never fork a component to add a variant** — add a prop.
5. **Sections receive data as props.** A section must never `import { products } from '@/data/...'`.
   That import belongs in `app/page.jsx`. This is what makes every section API-ready.
6. **Cards receive one flat object plus callbacks.** No prop drilling deeper than two levels.
7. **Composition over configuration.** Prefer `children` to a `renderX` prop.
8. **Always forward `className`** and merge it last through `cn()`.
9. **Never use array index as a React key.** Use `id` or `slug`.
10. **No business logic in components.** Formatting, filtering and sorting live in `utils/`.

```jsx
export default function ProductCard({
  image, imageAlt, title, slug, price, oldPrice = null,
  rating = null, badge = null, priority = false, className,
}) {
  return <article className={cn('…', className)}>…</article>
}
```

---

## 8. Server vs Client

`"use client"` is permitted **only** for: `useState`/`useReducer`/`useEffect`, a `ref` on a DOM node,
event handlers, browser APIs, or a context provider.

Push the boundary to the smallest leaf. `ProductCard` stays a Server Component; only
`WishlistButton` and `QuickAddButton` inside it are clients.

Never mark a whole section `"use client"` because one nested button needs state.

Expected client components in Phase 1: `Header`, `MobileDrawer`, `MobileNav`, `WishlistButton`,
`QuickAddButton`, `NewsletterForm`, `CategoryScroller`, `Reveal`. **Everything else is a Server Component.**

---

## 9. Image Optimization

1. **Always `next/image`.** Never `<img>`, never a CSS `background-image` for content.
2. Explicit `width`/`height`, **or** `fill` inside a `relative` parent with a fixed aspect ratio.
   No exceptions — this is what keeps CLS at 0.
3. `sizes` is mandatory with `fill`. Match the grid:
   ```jsx
   sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
   ```
4. `priority` on **exactly one** image per page — the hero. Everything else lazy-loads.
5. `alt` describes the subject. Never "image", "photo" or a filename. Decorative → `alt=""`.
6. Fixed aspect ratios per slot — see [`design.md` §15](./design.md#15-image-rules).
7. Reference by absolute public path. **Never import an image through the bundler.**
8. **Never reference anything under `reference/`.** That folder is not deployed and may be deleted.

---

## 10. Performance Rules

| Budget | Target |
| --- | --- |
| LCP | < 2.0s |
| INP | < 200ms |
| CLS | **0** |
| First-load JS (home) | < 120 KB gzipped |

- Server Components by default; ship as little JS as possible.
- `next/font/google` with `display: 'swap'` — no external font request, no FOUT.
- Import icons individually: `import { Search } from 'lucide-react'` — never `import * as Icons`.
- No third-party script before interactive. Analytics via `next/script strategy="afterInteractive"`.
- Dynamic-import below-the-fold client components.
- Animate only `transform`, `opacity`, `color`, `background-color`, `border-color`, `filter`.
  **Never** `width`, `height`, `top`, `left`.
- No barrel `index.js` re-export files — they defeat tree-shaking.

---

## 11. Accessibility

Full spec: [`accessibility.md`](./accessibility.md). The non-negotiables:

- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<ul>/<li>` for grids.
- One `<h1>` per page; `<h2>` per section; no skipped levels. The eyebrow is **not** a heading.
- Visible focus everywhere: `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`.
  Removing an outline without replacing it is an automatic rejection.
- `aria-label` on every icon-only control; `aria-hidden="true"` on every decorative icon.
- Minimum 44 × 44px hit area.
- Never convey state by colour alone — pair with `aria-current` / `aria-pressed` / text.
- **Gold text on white fails contrast (2.4:1). Decorative use only.** Never for body copy, labels,
  errors, prices or links.
- Wrap every animation in `prefers-reduced-motion`.

---

## 12. SEO

Full spec: [`seo.md`](./seo.md). Per route:

- Export `metadata` (static) or `generateMetadata` (dynamic). **A route without metadata does not merge.**
- Title ≤ 60 chars, description 140–160 chars, unique per page, one canonical.
- JSON-LD via a Server Component; it must describe only what is visibly on the page.
- Never `next/head`. Never a hand-written `<head>` tag.
- Internal links use `next/link` so they are crawlable.

---

## 13. Responsive Strategy

Full spec: [`responsive.md`](./responsive.md).

- Breakpoints: base (mobile) → `md:` 768 (tablet) → `xl:` 1280 (desktop). Mobile-first, always.
- `sm:` and `lg:` are grid-smoothing only, never content changes. No `max-*` variants.
- Only three things may change: column count, spacing/type scale, and how the *same* content is presented.
- **Forbidden:** `hidden md:block` around content, slicing arrays per breakpoint, different copy per
  breakpoint, JS width checks to swap components.
- Bottom navigation is mobile-only. It is the single exception, and it is a navigation surface,
  not content.

---

## 14. State Management

| Kind | Where | Phase |
| --- | --- | --- |
| Server data | Server Components `await` a fetcher | 3 |
| URL state (filters, sort, page) | `searchParams`. **The URL is state.** | 2 |
| Global client state (cart, wishlist) | Zustand store in `lib/store/` | 4 |
| Client server-cache (search-as-you-type) | TanStack Query | 3 |
| Form state | Uncontrolled + `FormData`; React Hook Form only if a form exceeds ~6 fields | 1 |
| Ephemeral UI (drawer open, hover) | Local `useState` in the leaf | 1 |

**Rules**

1. **No global state in Phase 1.** None is needed.
2. Never use Context for data that changes often — it re-renders the whole subtree.
   Context is for stable values (theme, locale, session).
3. Never mirror server data into client state. Fetch it on the server and pass it down.
4. Filters and sort live in the URL so results are shareable, bookmarkable and crawlable.
5. Zustand stores expose selectors, never the whole store, so components subscribe narrowly.

---

## 15. How To: Add a Page

1. Create `app/<segment>/page.jsx`. Use a route group (`app/(shop)/`) if it should not add a URL segment.
2. Export `metadata` or `generateMetadata` ([`seo.md` §1](./seo.md#1-metadata)).
3. Keep it a Server Component. Fetch or import data **here**, pass it down as props.
4. Compose from `<Section>` + `<SectionHeader>` + existing components. Never hand-roll padding,
   max-width or a heading.
5. Set the rendering strategy explicitly ([`architecture.md` §7](./architecture.md#7-rendering-strategy)).
6. Add the route to `app/sitemap.js`.
7. Verify at 390 / 1024 / 1920 with identical content, then run the quality gates.

```jsx
// app/(shop)/category/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const category = await getCategory(params.slug)
  return { title: `${category.name} Bags`, description: category.description }
}

export default async function CategoryPage({ params }) {
  const [category, products] = await Promise.all([
    getCategory(params.slug),
    getProductsByCategory(params.slug),
  ])
  return (
    <Section>
      <SectionHeader eyebrow={category.eyebrow} title={category.name} />
      <ProductGrid products={products} columns={4} />
    </Section>
  )
}
```

---

## 16. How To: Add a Product

**Phase 1 (static).** Append to `data/products.js` using the exact contract from
[`architecture.md` §4.1](./architecture.md#41-the-data-contract):

```js
{
  id: 'nova-crossbody',
  slug: 'nova-crossbody',
  title: 'Nova Crossbody',
  price: 129,
  oldPrice: null,
  currency: 'USD',
  rating: 4.0,
  reviewCount: 0,
  image: '/images/products/nova-crossbody.webp',
  imageAlt: 'Nova Crossbody black quilted bag with a gold chain strap',
  badge: null,                 // 'new' | 'best-seller' | null
  category: 'women',
  collections: ['best-sellers'],
  inStock: true,
}
```

- Add the image per [`assets.md` §7](./assets.md#7-adding-a-new-asset) — WebP, `slug`-named, ≤ 300 KB.
- Prices are **numbers in major units**. Formatting is `utils/formatPrice.js`'s job.
- `slug` is permanent. Renaming one after launch requires a 301 redirect.
- Membership in a homepage row is driven by `collections`, never by array position.

**Phase 3+ (API/CMS).** Products come from the backend. The object shape above does not change —
that is the whole point of the contract.

---

## 17. How To: Add an API

1. Create `lib/api/<resource>.js`. Never call `fetch` from a component.
2. Go through the shared client in `lib/api/client.js` (base URL, headers, timeout, retry,
   normalised errors). Never a bare `fetch`.
3. Validate the response at the boundary before it reaches a component. Never trust the wire.
4. Map the wire shape to the app's shape. Components must never see a vendor-shaped object.
5. Set caching explicitly: `{ next: { revalidate: 3600, tags: ['products'] } }`.
6. Secrets live in `.env.local`, are read **server-side only**, and never carry the
   `NEXT_PUBLIC_` prefix.

```js
// lib/api/products.js
import { client } from './client'
import { toProduct } from './mappers'

export async function getProducts({ category, limit = 24, cursor } = {}) {
  const data = await client.get('/products', {
    query: { category, limit, cursor },
    next: { revalidate: 3600, tags: ['products'] },
  })
  return { items: data.items.map(toProduct), nextCursor: data.next_cursor }
}
```

Route handlers (`app/api/*/route.js`) are for **this app's own** endpoints only — webhooks, form
submissions, revalidation hooks. Never as a proxy to fetch your own data from a Server Component.

---

## 18. How To: Integrate a CMS Later

1. Everything editable already lives in `data/*.js`. That is the seam — nothing else moves.
2. Add `lib/cms/{client,queries,mappers}.js`.
3. **Mappers are mandatory.** A CMS document must be transformed into the app's shape before it
   reaches a component. This is what keeps a CMS swap a one-folder change.
4. Point `app/page.jsx` at the CMS fetcher. Sections are untouched.
5. Wire Draft Mode for preview and a webhook to `revalidateTag()` for publish.
6. Never let a CMS-shaped object cross into `components/`.

---

## 19. How To: Integrate Authentication Later

1. Auth.js (NextAuth v5): `lib/auth/`, `app/api/auth/[...nextauth]/route.js`.
2. Sessions in **httpOnly cookies**. Never `localStorage`. Never a token in client state.
3. Protect routes in `middleware.js`, and **re-check authorisation in every Server Action and route
   handler**. Middleware is a convenience, not a security boundary.
4. `app/(auth)/` for login/register; `app/(account)/` for the account area, all
   `noindex` + `dynamic = 'force-dynamic'`.
5. `Header`'s account icon becomes a menu when a session exists — a prop change, not a rewrite.
6. On login, merge the guest cart into the user cart server-side.
7. Never render user-specific content in a statically generated page.

---

## 20. How To: Integrate Dashboards Later

1. `app/(admin)/admin/` with its **own layout** — the storefront header and footer do not apply.
2. Role-gate at the middleware **and** re-check in every action.
3. Reuse the **design system**, not the storefront components. Admin needs `DataTable`, `FormBuilder`,
   `Modal`, `Toast`, `Tabs`, `DatePicker` — build them in `components/admin/`.
4. Server Actions for mutations. Optimistic UI only where a failure is cheap to undo.
5. Never import an admin component into the storefront bundle.
6. Audit-log every write: who, what, when, before, after.

---

## 21. How To: Scale to a Large Database

1. **Never load a full catalogue into memory.** Every list is paginated at the query layer.
2. **Cursor pagination, not `OFFSET`.** `OFFSET 50000` is a table scan.
3. **Search goes to a search engine** (Algolia / Meilisearch / Typesense), never `LIKE '%term%'`.
4. Index every column that appears in a filter, sort or join.
5. `generateStaticParams` covers the top N products; the long tail renders on demand with ISR.
6. Product media moves to object storage + a CDN. `public/` stays for brand assets only.
7. Cache in layers: edge (static) → Redis (session, cart) → ISR (catalogue) → DB read replicas.
8. **Component implication:** `ProductGrid` must handle 60 cards without jank. Virtualise only if
   measurement proves it necessary — do not pre-optimise.

---

## 22. How To: Add an Admin Panel

See §20 and [`roadmap.md` Phase 8](./roadmap.md#phase-8--admin-dashboard).
The one rule worth repeating: **admin and storefront share tokens, not components.**

---

## 23. Before You Commit

- [ ] No TypeScript, no forbidden library, no new `.css` file
- [ ] No raw hex, no arbitrary font-size, no magic spacing
- [ ] No duplicated component or copy-pasted markup
- [ ] No file over 150 lines
- [ ] `"use client"` only where §8 permits, at the smallest leaf
- [ ] Every image is `next/image` with `alt`, dimensions, and `sizes` where `fill` is used
- [ ] Identical content renders at 390px, 1024px and 1920px
- [ ] Keyboard-reachable, focus visible, `aria-label` on every icon-only control
- [ ] Route exports `metadata`
- [ ] `next build` clean, zero console errors or warnings
- [ ] Pixel-diffed against the reference mockup

---

## 24. When In Doubt

1. Check [`design.md`](./design.md) — it has already reconciled the three mockups.
2. Check [`components.md`](./components.md) — the component you need probably exists.
3. Check §14 of `design.md` — the mockups contradict each other in ten known places, and each one
   is already resolved. **Do not "fix" the code back toward a mockup.**
4. Still unclear? **Ask. Do not invent.** An invented pattern costs more to remove than to prevent.
