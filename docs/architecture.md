# Architecture

> How this codebase is organised and why. Read this before adding a file.

---

## 1. Stack

| Layer | Choice | Installed | Locked? |
| --- | --- | --- | --- |
| Framework | **Next.js (App Router), Turbopack** | `16.2.12` | Yes |
| Language | **JavaScript only** — no TypeScript, no `.ts`/`.tsx` | — | Yes |
| UI | **React** (Server Components by default) | `19.2.4` | Yes |
| Styling | **Tailwind CSS utilities only** (v4, CSS-first) | `^4` | Yes |
| Icons | **`lucide-react`** | `^1.27.0` | Yes |
| Class merging | `clsx` + `tailwind-merge` via `utils/cn.js` | `^2.1.1` / `^3.6.0` | Yes |
| Linting | ESLint 9 flat config + `eslint-config-next` | `^9` | Yes |
| Backend | **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) | `^2.110` / `^0.12` | Yes |
| Fonts | `next/font/google` — Outfit + Geist Mono | — | Yes |
| Images | `next/image` | — | Yes |
| State (later) | Zustand for client state · TanStack Query for server state | — | Provisional |

> **Next.js 16 has breaking changes from Next 13/14/15.** The authoritative docs ship with the
> package at `node_modules/next/dist/docs/`. Read the relevant guide there before using a Next.js
> API rather than relying on recalled conventions. This is also why `AGENTS.md` sits at the repo
> root — it is maintained by Next.js itself and is imported by `CLAUDE.md`.
>
> **Tailwind v4 is CSS-first — there is no `tailwind.config.js`.** All design tokens live in the
> `@theme` block of `app/globals.css`. PostCSS wiring is `@tailwindcss/postcss` in
> `postcss.config.mjs`.

**Explicitly forbidden:** TypeScript, Bootstrap, Material UI, Chakra, styled-components, Emotion,
Sass, standalone `.css` files beyond `app/globals.css`, CSS Modules (unless a third-party integration
makes it genuinely unavoidable — document the reason in the PR), inline `style={{}}` (unless the value
is computed at runtime, e.g. a progress width).

---

## 2. Folder Structure

```
knbagwebsite/
├── app/                          # App Router — routes only
│   ├── layout.jsx                # Root: <html>, fonts, sitewide JSON-LD. No chrome.
│   ├── globals.css               # Tailwind directives + @theme tokens + reduced-motion. Nothing else.
│   ├── not-found.jsx
│   ├── sitemap.js  robots.js     # Metadata routes
│   ├── (site)/                   # Storefront group — Header/Footer/MobileNav chrome
│   │   ├── layout.jsx
│   │   ├── page.jsx              #   Home landing page — composes home/ sections
│   │   └── …                     #   27 public routes. Route groups do not change URLs.
│   └── (admin)/admin/            # Dashboard group — AdminShell chrome. See admin.md
│       ├── layout.jsx
│       └── …                     #   22 modules
│
├── components/
│   ├── common/                   # Reused in 3+ places, page-agnostic
│   ├── layout/                   # Storefront chrome: Header, Footer, Container, Section, MobileNav
│   ├── home/                     # Homepage sections only. One file per section.
│   ├── product/                  # Commerce primitives: ProductCard, Rating, PriceTag, WishlistButton
│   ├── ui/                       # Unstyled/low-level primitives: Button, Badge, Input, Skeleton
│   └── admin/                    # Dashboard only — layout/, ui/, modules/, seo/. See admin.md
│
├── constants/                    # Frozen values that never change at runtime
│   ├── navigation.js             # Header nav, footer columns, mobile bottom-nav items
│   ├── site.js                   # Name, tagline, URLs, social handles, contact
│   └── breakpoints.js            # Numeric breakpoints mirrored from the @theme block
│
├── data/                         # Static content. Becomes the API/CMS boundary later.
│   ├── products.js
│   ├── categories.js
│   ├── features.js               # Brand Promise items
│   ├── reviews.js
│   └── instagram.js
│
├── hooks/                        # Client-only React hooks. Each file exports one hook.
├── lib/                          # External-facing integrations (api client, cms, analytics)
│   └── supabase/                 # Supabase clients — see supabase.md
│       ├── env.js                #   the only file that reads process.env for Supabase
│       ├── client.js             #   Client Components
│       ├── server.js             #   Server Components / Actions / Route Handlers
│       ├── admin.js              #   service role, bypasses RLS. `server-only`
│       └── middleware.js         #   session refresh, consumed by proxy.js
├── proxy.js                      # Next 16 renamed `middleware` -> `proxy`. Refreshes Supabase session.
├── .env.local.example            # Committed placeholder template (see .gitignore exception)
├── utils/                        # Pure functions. No React, no side effects, no imports from components/
│   └── cn.js                     # clsx + tailwind-merge helper
├── public/                       # Static assets — see assets.md
├── docs/                         # This documentation set. The source of truth.
├── AGENTS.md                     # Next.js-maintained agent rules. Imported by CLAUDE.md. Do not edit.
├── CLAUDE.md                     # AI/agent working rules (points at docs/)
├── jsconfig.json                 # Path alias: "@/*" -> "./*"
├── eslint.config.mjs             # ESLint 9 flat config
├── postcss.config.mjs            # @tailwindcss/postcss
└── next.config.mjs
```

> There is no `tailwind.config.js` and no `styles/` directory. Tailwind v4 is configured entirely
> from the `@theme` block in `app/globals.css`.

### 2.1 What goes where — the decision tree

```
Is it a route?                          -> app/
Is it page chrome (header/footer/shell)? -> components/layout/
Is it only used by the homepage?         -> components/home/
Is it a commerce concept?                -> components/product/
Is it a styling-free primitive?          -> components/ui/
Is it used by 3+ unrelated places?       -> components/common/
Is it a pure function?                   -> utils/
Does it call something external?         -> lib/
Does it use React state/effects?         -> hooks/
Is it content that will come from a CMS? -> data/
Is it a value that literally never changes? -> constants/
```

**Promotion rule:** a component starts in the most specific folder that fits. The moment a second
unrelated page imports it, move it to `common/` in the same PR. Never leave a shared component in
`home/`.

---

## 3. Server vs Client Components

Server Components are the default. A file only becomes a Client Component when it genuinely needs
the browser.

**`"use client"` is permitted in exactly these cases:**
- `useState`, `useReducer`, `useEffect`, `useRef` on a DOM node
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Browser APIs (`window`, `localStorage`, `IntersectionObserver`)
- Context providers

**Push the boundary as far down the tree as possible.** `ProductCard` stays a Server Component;
only its `WishlistButton` and `QuickAddButton` are clients. Never mark a whole section `"use client"`
because one button inside it needs state.

Current expected client components:
`Header` (mobile drawer state) · `MobileNav` · `WishlistButton` · `QuickAddButton` ·
`NewsletterForm` · `CategoryScroller` (mobile scroll state) · `Reveal` (IntersectionObserver).

Everything else is a Server Component.

---

## 4. Data Flow

```
data/*.js  ->  app/page.jsx (server)  ->  section component  ->  card component
```

- Sections receive their data as props from the page. A section **never** imports from `data/` itself.
  This keeps every section drop-in ready for a real API later — you swap the page's data source and
  nothing below changes.
- Cards receive a single flat object plus explicit callbacks. No prop drilling deeper than two levels.
- No global state in v1. When cart/wishlist arrive, they go in Zustand stores under `lib/store/`,
  consumed only by leaf client components.

### 4.1 The data contract

`data/products.js` exports an array whose shape is deliberately API-like, so the migration to a
real backend is a fetch swap and nothing more:

```js
{
  id: 'apex-duffle-pro',
  slug: 'apex-duffle-pro',
  title: 'Apex Duffle Pro',
  price: 249,
  oldPrice: null,
  currency: 'USD',
  rating: 5.0,
  reviewCount: 0,
  image: '/images/products/apex-duffle-pro.webp',
  imageAlt: 'Apex Duffle Pro dark leather weekend duffle on a stone plinth',
  badge: null,              // 'new' | 'best-seller' | null
  category: 'travel',
  collections: ['featured'],
  inStock: true,
}
```

Prices are stored as **numbers in major units**. Formatting is `utils/formatPrice.js`'s job —
never format inline in a component.

---

## 5. Styling Architecture

- **All styling is Tailwind utilities in JSX.** There is no component stylesheet.
- Design tokens are declared once in the `@theme` block of `app/globals.css` (colours, radii, fonts,
  type scale) and consumed as semantic classes: `text-ink`, `bg-surface-muted`, `border-border`,
  `rounded-card`, `text-h2-xl`.
- Responsive type uses discrete tokens rather than `clamp()`, because the design specifies exact
  sizes at exact breakpoints: `text-display md:text-display-md xl:text-display-xl`.
- **Never write a raw hex, a raw font-size or an arbitrary spacing value in a component.**
  If a value is missing, add it as a token first.
- Conditional classes use `clsx` + `tailwind-merge` via a single helper:

  ```js
  // utils/cn.js
  import clsx from 'clsx'
  import { twMerge } from 'tailwind-merge'
  export function cn(...inputs) { return twMerge(clsx(inputs)) }
  ```

- Variant-heavy components (`Button`, `Badge`) use a plain lookup object, not a CVA dependency:

  ```js
  const VARIANTS = {
    primary:   'h-13 px-8 bg-gold text-ink hover:brightness-95',
    secondary: 'h-13 px-8 border-2 border-ink text-ink hover:bg-ink hover:text-white',
    dark:      'h-8 px-5 bg-ink text-white text-sm hover:bg-ink/90',
  }
  ```

- `app/globals.css` contains **only**: the Tailwind directives, the `@theme`/`:root` token block,
  the base `body` font/colour, and the `prefers-reduced-motion` override. Nothing else may be added.

---

## 6. Path Aliases

`jsconfig.json` maps `@/*` to the project root. Always use aliases; relative imports beyond one
level (`../../`) are not allowed.

```js
import ProductCard from '@/components/product/ProductCard'
import { products }  from '@/data/products'
import { cn }        from '@/utils/cn'
```

---

## 7. Rendering Strategy

| Page type | Strategy | Reason |
| --- | --- | --- |
| Home | Static (SSG) | Content is build-time data today; ISR-ready later |
| Category / listing | SSG + ISR (`revalidate: 3600`) | Product data changes slowly |
| Product detail | SSG + ISR, `generateStaticParams` for the top N | Fast first paint, long tail on demand |
| Search / filtered results | Server-rendered on request | Query-dependent |
| Cart / checkout / account | Client-side, `dynamic = 'force-dynamic'` | Per-user, never cached |

Set the strategy explicitly in each route. Never rely on an implicit default.

---

## 8. Import Order

Enforced top-to-bottom in every file, blank line between groups:

1. React / Next
2. Third-party packages
3. `@/components/...`
4. `@/hooks`, `@/lib`, `@/utils`
5. `@/data`, `@/constants`
6. Assets / styles

---

## 9. Composition Example

The homepage stays declarative — it wires data to sections and does nothing else.

```jsx
// app/page.jsx  (Server Component)
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection categories={categories} />
      <ProductSection
        eyebrow="ELEGANCE REFINED"
        title="Featured Collection"
        products={getByCollection('featured')}
        background="muted"
      />
      <FeatureSection features={features} divided />
      <ProductSection
        eyebrow="ELITE FAVORITES"
        title="Best Sellers"
        products={getByCollection('best-sellers')}
      />
      <NewArrivalsSection
        featured={getByCollection('new-featured')}
        products={getByCollection('new')}
      />
      <PromoBanner {...promo} />
      <ReviewSection reviews={reviews} />
      <InstagramSection posts={instagram} />
      <NewsletterSection />
    </>
  )
}
```

`Featured Collection` and `Best Sellers` are the **same component** with different props. If you
find yourself writing a second near-identical section component, you have made a mistake.

---

## 10. Scalability Boundaries

These seams exist from day one so that later features are additive, not surgical:

| Seam | Today | Later |
| --- | --- | --- |
| `data/*.js` | Static arrays | Replaced by `lib/api/` fetchers — the shape stays identical |
| `lib/` | Empty | API client, CMS adapter, auth adapter, analytics, payments |
| `app/(shop)/` | Empty route group | `/shop`, `/product/[slug]`, `/category/[slug]`, `/search` |
| Page → section props | Page passes literal data | Page `await`s a fetcher, passes the same shape |
| `Container` / `Section` | Layout primitives | Unchanged — every future page inherits correct rhythm |
| `utils/formatPrice` | Hard-codes USD | Reads currency + locale from context |

Full expansion plan: [`roadmap.md`](./roadmap.md).

---

## 11. Quality Gates

Before any PR merges:

- [ ] No TypeScript, no forbidden UI library, no new `.css` file
- [ ] No raw hex / arbitrary font-size / magic spacing in a component
- [ ] No component over 150 lines, no duplicated card or section markup
- [ ] `"use client"` appears only where §3 permits
- [ ] Every image is `next/image` with `alt`, dimensions and (if `fill`) `sizes`
- [ ] Identical content renders at 390px, 1024px and 1920px
- [ ] Keyboard-reachable, visible focus, `aria-label` on every icon-only control
- [ ] `next build` clean, zero console errors/warnings
