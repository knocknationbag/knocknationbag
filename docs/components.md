# Component Inventory

> Every reusable component, its props, and where it is used.
> **Rule zero: if a card, button, heading or badge appears twice, it is a component.**
> Never duplicate markup. Never fork a component to add a variant — add a prop.

Status legend: `PLANNED` = specified here, not yet written.

---

## Index

| Component | Folder | Client? | Status |
| --- | --- | --- | --- |
| [Container](#container) | `layout/` | no | PLANNED |
| [Section](#section) | `layout/` | no | PLANNED |
| [SectionHeader](#sectionheader) | `common/` | no | PLANNED |
| [Header](#header) | `layout/` | **yes** | PLANNED |
| [MobileDrawer](#mobiledrawer) | `layout/` | **yes** | PLANNED |
| [MobileNav](#mobilenav) | `layout/` | **yes** | PLANNED |
| [Footer](#footer) | `layout/` | no | PLANNED |
| [Logo](#logo) | `common/` | no | PLANNED |
| [Button](#button) | `ui/` | no | PLANNED |
| [Badge](#badge) | `ui/` | no | PLANNED |
| [Input](#input) | `ui/` | no | PLANNED |
| [IconTile](#icontile) | `ui/` | no | PLANNED |
| [Rating](#rating) | `product/` | no | PLANNED |
| [PriceTag](#pricetag) | `product/` | no | PLANNED |
| [WishlistButton](#wishlistbutton) | `product/` | **yes** | PLANNED |
| [QuickAddButton](#quickaddbutton) | `product/` | **yes** | PLANNED |
| [ProductCard](#productcard) | `product/` | no | PLANNED |
| [ProductGrid](#productgrid) | `product/` | no | PLANNED |
| [FeatureProductCard](#featureproductcard) | `product/` | no | PLANNED |
| [CategoryCard](#categorycard) | `common/` | no | PLANNED |
| [FeatureCard](#featurecard) | `common/` | no | PLANNED |
| [ReviewCard](#reviewcard) | `common/` | no | PLANNED |
| [Banner](#banner) | `common/` | no | PLANNED |
| [Newsletter](#newsletter) | `common/` | **yes** | PLANNED |
| [Reveal](#reveal) | `common/` | **yes** | PLANNED |
| Home sections | `home/` | no | PLANNED |

---

## Layout primitives

### Container

Horizontal rhythm for the whole site. **Every** section's content sits inside one.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `as` | string | `'div'` | Render element |
| `className` | string | — | Merged via `cn()` |
| `children` | node | — | required |

```
w-full mx-auto max-w-[1920px] px-4 md:px-12 xl:px-20
```

Yields 358 / 928 / 1760px content widths — matching all three mockups exactly.

---

### Section

Vertical rhythm + background band. Wraps `Container`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `background` | `'surface' \| 'muted'` | `'surface'` | `#FFFFFF` / `#F8FAFC` |
| `divided` | boolean | `false` | Adds `border-t border-border` (used between Featured Collection and Brand Promise) |
| `bleed` | boolean | `false` | Skips `Container` — for PromoBanner and InstagramStrip |
| `id` | string | — | Anchor target |
| `className` | string | — | — |

Padding: `py-12 md:py-18 xl:py-25` (48 / 72 / 100px).

---

### SectionHeader

The eyebrow + heading pair that opens almost every section.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `eyebrow` | string | — | Uppercase mono, gold. Omit to hide |
| `title` | string | — | required, renders `<h2>` |
| `align` | `'center' \| 'left'` | `'center'` | Mobile forces `left` per the mockup |
| `as` | `'h1' \| 'h2' \| 'h3'` | `'h2'` | Heading level for document outline |

Spacing: eyebrow → title 16px, title → content 40px (see design.md §5.1).

**Usage:** every section. Never hand-write an `<h2>` in a section.

---

### Header

| Prop | Type | Default |
| --- | --- | --- |
| `cartCount` | number | `0` |
| `activeHref` | string | — |

- 80px desktop/tablet, 56px mobile. Sticky, `z-50`, white, 1px bottom border.
- Nav items come from `constants/navigation.js` — **never hard-code links in JSX**.
- Client component only because it owns the mobile drawer's open state.

---

### MobileDrawer

Slide-in panel holding the full nav, rendered by `Header` below `md`.

| Prop | Type |
| --- | --- |
| `open` | boolean |
| `onClose` | function |
| `items` | array |

Must trap focus, close on `Escape`, close on backdrop click, and set `aria-modal="true"`.

---

### MobileNav

Floating bottom navigation. **Mobile only** (`md:hidden`). Five items: Home, Categories, Wishlist, Cart, Profile.

| Prop | Type | Default |
| --- | --- | --- |
| `activeHref` | string | — |
| `cartCount` | number | `0` |

- `fixed bottom-4 inset-x-4 z-50`, white, `rounded-full`, `shadow-[0_-1px_24px_rgba(17,24,39,0.10)]`.
- Active item is gold (icon + label); inactive is `ink`.
- Labels are always visible — never icon-only.
- Footer must carry `pb-24 md:pb-0` so this never covers content.

---

### Footer

No props. Reads `constants/navigation.js` and `constants/site.js`.
4-column grid on desktop/tablet, single stacked column on mobile.

---

### Logo

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'white' \| 'mono'` | `'default'` | Picks the monogram SVG |
| `showWordmark` | boolean | `true` | `false` = monogram only |
| `size` | number | `38` | Monogram px; wordmark scales with it |
| `href` | string \| null | `'/'` | `null` renders a non-link (footer) |

Used in: Header, MobileDrawer, Footer, MobileNav (monogram only), favicon source.

---

## UI primitives

### Button

The only button in the codebase. Every clickable action uses it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'dark' \| 'ghost'` | `'primary'` | See design.md §10.1 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 32 / 50 / 52px |
| `href` | string | — | Renders `next/link` instead of `<button>` |
| `fullWidth` | boolean | `false` | Mobile hero and newsletter |
| `icon` | LucideIcon | — | Leading icon |
| `iconPosition` | `'left' \| 'right'` | `'left'` | — |
| `disabled` | boolean | `false` | `opacity-50 cursor-not-allowed` |
| `loading` | boolean | `false` | Spinner, keeps width, sets `aria-busy` |
| `type` | string | `'button'` | — |
| `onClick` | function | — | Presence forces a client parent |

Always `rounded-full`. Always `focus-visible:ring-2 ring-gold ring-offset-2`.

---

### Badge

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'new' \| 'bestSeller' \| 'verified' \| 'neutral'` | `'neutral'` | — |
| `children` | node | — | Label text |

- `new` → `bg-gold text-ink` · `bestSeller` → `bg-ink text-white`
- `verified` → `bg-[#D1FAE5] text-[#065F46]`
- Always mono 11px, `tracking-[0.1em]`, uppercase, `rounded-badge`, `px-2 py-[3px]`.

---

### Input

| Prop | Type | Default |
| --- | --- | --- |
| `type` | string | `'text'` |
| `label` | string | — (visually hidden if `hideLabel`) |
| `hideLabel` | boolean | `false` |
| `placeholder` | string | — |
| `error` | string | — |
| `id` | string | auto |

Never ship an input without a label — use `hideLabel` for the newsletter, not a missing label.

---

### IconTile

The 48px gold-tinted circle behind FeatureCard icons.

| Prop | Type | Default |
| --- | --- | --- |
| `icon` | LucideIcon | required |
| `size` | number | `48` |

`bg-gold/10`, icon 22px `text-gold`, `rounded-full`.

---

## Product primitives

### Rating

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | number | required | 0–5, one decimal |
| `showValue` | boolean | `true` | Renders `(5.0)` |
| `size` | number | `14` | 16 in ReviewCard |
| `variant` | `'stars' \| 'compact'` | `'stars'` | `compact` = one star + number (mobile-dense contexts) |

Renders `<span role="img" aria-label="Rated 5.0 out of 5">` around the stars so screen readers get
one clean announcement instead of five.

---

### PriceTag

| Prop | Type | Default |
| --- | --- | --- |
| `price` | number | required |
| `oldPrice` | number | — |
| `currency` | string | `'USD'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

`oldPrice` renders struck-through in `muted` before the current price, with
`<s>` + `aria-label="Was $299"`. Formatting delegates to `utils/formatPrice.js`.

---

### WishlistButton

`"use client"`. 34px white circle, 44px hit area, `heart` icon.

| Prop | Type | Default |
| --- | --- | --- |
| `productId` | string | required |
| `isActive` | boolean | `false` |
| `onToggle` | function | — |

`aria-pressed` reflects state. `aria-label` is `"Add {title} to wishlist"` /
`"Remove {title} from wishlist"`.

---

### QuickAddButton

`"use client"`. Thin wrapper over `<Button variant="dark" size="sm">`.

| Prop | Type | Default |
| --- | --- | --- |
| `productId` | string | required |
| `label` | string | `'Quick Add'` |
| `onAdd` | function | — |

Label is `Quick Add` at **every** breakpoint (design.md §14, deviation 4).

---

### ProductCard

**The most reused component in the project.** One implementation, four contexts.

| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `image` | string | ✔ | Path under `/images/products/` |
| `imageAlt` | string | ✔ | Descriptive; never "product image" |
| `title` | string | ✔ | — |
| `slug` | string | ✔ | Links to `/product/{slug}` |
| `price` | number | ✔ | Major units |
| `oldPrice` | number | — | Renders struck-through |
| `rating` | number | — | Hides the row if absent |
| `badge` | `'new' \| 'best-seller' \| null` | — | Top-left overlay; `new` wins if both apply |
| `priority` | boolean | — | `false`. Never `true` outside the first viewport |
| `sizes` | string | — | Defaults to the standard 4/3/2 grid string |

**Used in:** Home (Featured Collection, Best Sellers, New Arrivals) · Category listing ·
Search results · Wishlist · Related products · Recently viewed.

**Responsive behaviour** — layout only; content is identical everywhere:

| | Mobile <768 | Tablet 768–1279 | Desktop ≥1280 |
| --- | --- | --- | --- |
| Grid | 2 columns, gap 12 | 3 columns, gap 16 | 4 columns, gap 24 |
| Card padding | 12px | 16px | 16px |
| Image ratio | `39/28` | `39/28` | `39/28` |
| Title | 16/700 | 17/700 | 18/700 |
| Price | 20/700 | 22/700 | 24/700 |
| Rating | 5 stars @ 12px | 5 stars @ 14px | 5 stars @ 14px |
| Quick Add | 30px pill, label `Quick Add` | 32px pill | 32px pill |
| Wishlist | 32px circle | 34px circle | 34px circle |

Never hide the rating, the badge or the Quick Add button at any breakpoint.

---

### ProductGrid

Wraps `ProductCard` in the canonical responsive grid so no section re-declares it.

| Prop | Type | Default |
| --- | --- | --- |
| `products` | array | required |
| `columns` | `2 \| 3 \| 4` | `4` | Desktop count; tablet/mobile derive automatically |
| `priorityCount` | number | `0` | How many leading images get `priority` |

`columns={4}` → `grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 xl:gap-6`
`columns={3}` → `grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 xl:gap-6`

---

### FeatureProductCard

The wide, image-filled New Arrivals card (868 × 360 on desktop) with the title and price laid over
the photo. A distinct component because its anatomy genuinely differs from `ProductCard`.

| Prop | Type | Required |
| --- | --- | --- |
| `image` / `imageAlt` | string | ✔ |
| `title` / `slug` | string | ✔ |
| `price` | number | ✔ |
| `badge` | string | — |

Layout: `aspect-[217/90]`, `rounded-card`, overlay scrim, title white 20/700 with price in gold
beneath, both inset 24px bottom-left. 2 columns desktop/tablet, 1 column mobile.

---

## Content cards

### CategoryCard

| Prop | Type | Required |
| --- | --- | --- |
| `image` / `imageAlt` | string | ✔ |
| `title` | string | ✔ |
| `slug` | string | ✔ |
| `variant` | `'tile' \| 'circle'` | — (`'tile'`) |

- `tile` — 11:8 image, `rounded-card`, scrim, white label + gold `arrow-right` bottom-left. Desktop & tablet.
- `circle` — 64px circular image with the label centred beneath. Mobile horizontal scroller only.

Both variants render **all 8 categories** (design.md §14, deviation 1).

---

### FeatureCard

| Prop | Type | Required |
| --- | --- | --- |
| `icon` | LucideIcon | ✔ |
| `title` | string | ✔ |
| `description` | string | ✔ |

5 columns desktop/tablet, 2 columns mobile. All **5** items render at every breakpoint.

---

### ReviewCard

| Prop | Type | Required |
| --- | --- | --- |
| `quote` | string | ✔ |
| `name` | string | ✔ |
| `role` | string | ✔ |
| `rating` | number | ✔ |
| `isVerified` | boolean | — |

Renders as `<figure>` + `<blockquote>` + `<figcaption>`. Grid uses `items-stretch` for equal heights
(design.md §14, deviation 8).

---

### Banner

Full-bleed promotional band. Reused for the homepage promo and any future campaign strip.

| Prop | Type | Default |
| --- | --- | --- |
| `image` / `imageAlt` | string | required |
| `title` | string | required |
| `subtitle` | string | — |
| `ctaLabel` / `ctaHref` | string | — |
| `height` | `'sm' \| 'md' \| 'lg'` | `'lg'` (240/360/480px responsive) |
| `align` | `'center' \| 'left'` | `'center'` |

---

### Newsletter

`"use client"`. Email capture band.

| Prop | Type | Default |
| --- | --- | --- |
| `title` | string | `'Join the Nation'` |
| `description` | string | — |
| `onSubmit` | function | — |

Client-side validation only in v1 (`type="email"` + `required`), success and error states inline,
`aria-live="polite"` on the status message.

---

### Reveal

`"use client"`. Optional scroll-in wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | node | required |
| `delay` | number | `0` |

Must render children **visible by default** and only animate as an enhancement, so content is never
gated on JS. Respects `prefers-reduced-motion`.

---

## Homepage sections (`components/home/`)

Each is a thin composition of the primitives above. None owns styling tokens or data imports.

| Component | Composes | Notes |
| --- | --- | --- |
| `HeroSection` | Container, Button, next/image | 2-col desktop/tablet; mobile puts the image first |
| `CategorySection` | Section, SectionHeader, CategoryCard | 4×2 grid; mobile switches to the `circle` scroller |
| `ProductSection` | Section, SectionHeader, ProductGrid | **Used twice** — Featured Collection and Best Sellers |
| `FeatureSection` | Section, SectionHeader, FeatureCard | `divided` prop draws the hairline above it |
| `NewArrivalsSection` | Section, SectionHeader, FeatureProductCard, ProductGrid | 2 wide cards then a 3-up row |
| `PromoBanner` | Section (`bleed`), Banner | Full-bleed |
| `ReviewSection` | Section, SectionHeader, ReviewCard | 3-up, `items-stretch` |
| `InstagramSection` | Section (`bleed`), next/image | 6 tiles desktop, 4 tablet, 3×2 mobile |
| `NewsletterSection` | Section (`muted`), Newsletter | — |

> `ProductSection` handling both Featured Collection and Best Sellers is the template for this
> codebase. Any time two sections differ only in copy and data, they are one component.

---

## Anti-patterns

Reject in review, without discussion:

1. A second card component that differs from `ProductCard` only in size or spacing.
2. `<h2 className="text-4xl font-extrabold ...">` written inline instead of `SectionHeader`.
3. A section that imports directly from `data/` instead of receiving props.
4. `hidden md:block` used to show *different content* per breakpoint (layout-only is fine).
5. `"use client"` at the top of a section file because one nested button needs state.
6. A raw hex, a raw `text-[19px]`, or a magic `mt-[37px]` in a component.
7. Copy-pasting the responsive grid string instead of using `ProductGrid`.
8. A component past 150 lines.
