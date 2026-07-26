# Roadmap — From Landing Page to Ecommerce Platform

> The homepage is phase 1 of a full commerce platform. Every architectural decision made now exists
> to make the phases below **additive** rather than a rewrite.

---

## Phase 0 — Foundation ✅ *(current)*

Documentation, folder structure, design system, asset organisation.
**No application code yet.**

---

## Phase 1 — Home Landing Page *(next)*

Pixel-accurate homepage from the reference mockups.

**Scope**
- `app/layout.jsx`, `app/page.jsx`, `app/globals.css`
- Layout: `Container`, `Section`, `Header`, `MobileDrawer`, `MobileNav`, `Footer`
- UI: `Button`, `Badge`, `Input`, `IconTile`
- Product: `ProductCard`, `ProductGrid`, `FeatureProductCard`, `Rating`, `PriceTag`,
  `WishlistButton`, `QuickAddButton`
- Common: `SectionHeader`, `Logo`, `CategoryCard`, `FeatureCard`, `ReviewCard`, `Banner`,
  `Newsletter`, `Reveal`
- Home sections: 9 components per [`components.md`](./components.md)
- Static data in `data/*.js`

**Out of scope:** backend, APIs, database, auth, admin, cart persistence, real product logic.

**Done when:** the page pixel-matches at 390 / 1024 / 1920; identical content at all three; Lighthouse
≥ 95 across the board; every quality gate in [`architecture.md` §11](./architecture.md#11-quality-gates) passes.

---

## Phase 2 — Catalogue Pages

Routes under `app/(shop)/`, all reusing Phase 1 components unchanged.

| Route | Notes |
| --- | --- |
| `/shop` | All products, `ProductGrid`, pagination |
| `/category/[slug]` | Filtered listing, breadcrumbs |
| `/product/[slug]` | Gallery, specs, related products (`ProductGrid` again) |
| `/collections/[slug]` | Curated sets |
| `/search` | Query-driven listing, `noindex` |
| `/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms` | Static content |

**New components:** `Breadcrumb`, `Pagination`, `ProductGallery`, `FilterSidebar`, `SortDropdown`,
`EmptyState`, `Skeleton`.

**Rule:** `ProductCard` is not modified. If a listing needs a new affordance, it arrives as a prop.

---

## Phase 3 — Data Layer

Replace `data/*.js` with real fetching. **The object shapes in
[`architecture.md` §4.1](./architecture.md#41-the-data-contract) do not change**, so no component is touched.

```
lib/
├── api/
│   ├── client.js          fetch wrapper: base URL, headers, error normalisation, retry
│   ├── products.js        getProducts, getProduct, getRelated
│   ├── categories.js
│   └── reviews.js
└── query/
    └── keys.js            TanStack Query cache keys
```

- Server Components `await` the fetchers directly. No client data fetching for page content.
- ISR: `revalidate: 3600` on listings, on-demand revalidation via webhook on product change.
- Client-side reads (search-as-you-type, infinite scroll) use TanStack Query.
- Zod (or a hand-rolled guard) validates every API response at the boundary — never trust the wire.

**Migration proof:** delete `data/products.js`, point the page at `lib/api/products.js`.
Nothing under `components/` changes. If that is not true, Phase 1 was built wrong.

---

## Phase 4 — Cart & Wishlist

**State:** Zustand stores in `lib/store/`, persisted to `localStorage`, hydrated on mount and
reconciled with the server once auth exists.

```
lib/store/
├── cartStore.js       items, add, remove, updateQty, clear, totals
└── wishlistStore.js   ids, toggle, clear
```

- `QuickAddButton` and `WishlistButton` already exist as client leaves — they simply start calling
  the store. No structural change.
- New: `CartDrawer`, `CartLineItem`, `CartSummary`, `/cart` page.
- The header cart badge subscribes to `cartStore` — replace the `cartCount` prop with a selector.
- Guard against hydration mismatch: render the badge only after mount.

---

## Phase 5 — Authentication

**Auth.js (NextAuth v5)** with credentials + OAuth, JWT sessions, middleware-protected routes.

```
app/(auth)/login, /register, /forgot-password, /reset-password
app/(account)/account, /account/orders, /account/addresses, /account/wishlist
lib/auth/
middleware.js
```

- `Header` account icon becomes a menu when a session exists.
- Guest carts merge into the user cart on login.
- Never store tokens in `localStorage` — httpOnly cookies only.
- All account routes are `noindex` and `dynamic = 'force-dynamic'`.

---

## Phase 6 — Checkout, Payments & Shipping

- `/checkout` — address → shipping → payment → review, one route with steps, server-validated.
- **Stripe** (Payment Intents) or a regional gateway; server-side confirmation only.
- Never handle raw card data — hosted elements only. PCI scope stays out of this codebase.
- Shipping-rate calculation, tax, order confirmation email, webhook-driven order status.
- Idempotency keys on every order mutation.

**New:** `CheckoutStepper`, `AddressForm`, `ShippingSelector`, `PaymentForm`, `OrderSummary`,
`OrderConfirmation`.

---

## Phase 7 — Content Management

Headless CMS (Sanity / Contentful / Strapi) behind an adapter so the choice stays reversible.

```
lib/cms/
├── client.js
├── queries.js
└── mappers.js   CMS shape -> the app's shape (architecture.md §4.1)
```

- Editable: homepage banners, category imagery, collections, promo copy, static pages, blog.
- **Mappers are mandatory.** Components must never see a CMS-shaped object. This is what keeps a
  CMS migration a one-folder change.
- Draft preview via Next.js Draft Mode; on-demand revalidation via CMS webhook.

---

## Phase 8 — Admin Dashboard

Separate route group, separate layout, role-gated at the middleware.

```
app/(admin)/admin/
├── page.jsx              KPIs
├── products/             CRUD, bulk actions, image upload, variants
├── orders/               list, detail, fulfilment, refunds
├── customers/
├── inventory/
├── categories/  brands/  coupons/
├── analytics/
└── settings/
```

- **Reuses the design system, not the storefront components.** Admin needs `DataTable`,
  `FormBuilder`, `Modal`, `Toast`, `Tabs`, `DatePicker` — build them in `components/admin/`.
- Server Actions for mutations; every action re-checks authorisation server-side. Never trust the client.
- Full audit log on every write.

---

## Phase 9 — Scale

Target: **100k+ products, 10k+ concurrent users.**

| Concern | Approach |
| --- | --- |
| Search | Algolia / Meilisearch / Typesense — never `LIKE` over a product table |
| Listings | Cursor pagination, not `OFFSET` |
| Images | CDN with on-the-fly transforms; `next/image` `loader` |
| Caching | Edge cache for static, Redis for sessions and cart, ISR for catalogue |
| Database | Read replicas, indexes on every filter column, connection pooling |
| Media | Object storage (S3/R2), never the repo — `public/` stays for brand assets only |
| Monitoring | Sentry, Vercel Analytics, RUM on Core Web Vitals |
| Feature flags | Server-evaluated, per-environment |

**Design-system implication:** `ProductGrid` must already handle 60 cards without jank. Virtualise
only if measurement demands it — do not pre-optimise.

---

## Phase 10 — Growth

Reviews with photos and moderation · loyalty points · referrals · abandoned-cart recovery ·
recommendations · A/B testing · multi-currency and i18n · PWA / mobile app via a shared API ·
marketplace or B2B tiers.

---

## Guardrails Across Every Phase

1. **The design system is not renegotiated.** New surfaces use existing tokens and components.
   A genuinely new pattern gets added to [`design.md`](./design.md) **before** it is coded.
2. **Content parity survives every phase.** Every new page carries identical content at all three
   breakpoints ([`responsive.md`](./responsive.md)).
3. **The data contract is the seam.** Changing where data comes from must never change what a
   component receives.
4. **Server-first stays the default.** Each new `"use client"` needs a justification that fits
   [`architecture.md` §3](./architecture.md#3-server-vs-client-components).
5. **No stack drift.** JavaScript only. Tailwind only. No second UI library, ever.
6. **Accessibility and SEO are entry criteria, not cleanup.** A phase is not done until
   [`accessibility.md`](./accessibility.md) and [`seo.md`](./seo.md) pass.
7. **Documentation moves with the code.** A PR that changes a pattern updates the doc in the same PR.

---

## Dependency Order

```
Phase 1  Home
   └─ Phase 2  Catalogue
        └─ Phase 3  Data layer
             ├─ Phase 4  Cart & wishlist
             │    └─ Phase 6  Checkout & payments  (needs Phase 5)
             ├─ Phase 5  Auth
             ├─ Phase 7  CMS
             └─ Phase 8  Admin  (needs 3 + 5)
                  └─ Phase 9  Scale
                       └─ Phase 10  Growth
```

Phases 3, 5 and 7 can proceed in parallel once Phase 2 is stable.
