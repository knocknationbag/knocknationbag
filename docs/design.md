# Knock Nation Bag — Design System

> **Single source of truth for all visual decisions.**
> Every page, component and feature built for this project must conform to this document.
> Derived by measurement from `reference/ui-ux/*` (desktop, tablet, mobile mockups + brand identity spec).
> If a value here disagrees with a mockup, this document wins — it has already reconciled the three mockups.

---

## 1. Brand Philosophy

**Knock Nation Bag** sells premium bags for work, travel and modern life. The brand line is
_"Carry Confidence. Designed for Every Journey."_

Three words drive every design decision:

| Principle | What it means in the UI |
| --- | --- |
| **Architectural** | Structure is visible. Straight edges, honest grids, generous white space, no decoration for its own sake. Section eyebrows are set in monospace to read like technical annotations. |
| **Premium** | Restraint. One accent colour used sparingly. No gradients, no glows, no drop shadows on cards — depth comes from a 1px hairline and disciplined spacing. |
| **Utilitarian** | Everything is legible and reachable. Prices, ratings and the add-to-cart action are always in the same place on every card, at every breakpoint. |

**Voice:** confident, technical, unfussy. Eyebrow labels are declarative fragments in caps
(`ARCHITECTURAL CURATION`, `THE CUTTING EDGE`, `UNCOMPROMISING STANDARD`, `ELITE FAVORITES`,
`THE NATION SPEAKS`, `SARTORIAL EXPRESSION`).

---

## 2. Design Language

- **Light-first.** The page alternates `#FFFFFF` and `#F8FAFC` bands to separate sections. There is no dark mode in v1.
- **Hairline separation, not shadows.** Cards, the header and section dividers all use a single `1px #E2E8F0` border. **No `box-shadow` appears anywhere in the reference.**
- **Gold is punctuation.** `#D4AF37` is used only for: the second hero headline line, eyebrow labels, primary buttons, the active nav item, rating stars, badges, the cart count, icon-tile backgrounds (at ~10% alpha), and arrow affordances. It never fills a large surface.
- **Ink is structure.** `#111827` carries all headings, all body-critical text, secondary buttons, `Quick Add`, and the footer background.
- **Photography does the emoting.** Product shots sit on neutral studio backgrounds; lifestyle imagery is warm and cinematic. The UI stays out of the way.
- **Full-bleed moments.** Exactly two elements break the container: the promo banner and the Instagram strip. Everything else lives inside the container.

---

## 3. Colour Palette

Adopted architecture: **01 "Luxury"** from `reference/ui-ux/brand-identity-part-1.png`
(the brand spec offers four; the mockups use this one exclusively).

### 3.1 Core tokens

| Token | Hex | Tailwind alias | Usage |
| --- | --- | --- | --- |
| `ink` | `#111827` | `text-ink` / `bg-ink` | All headings, product titles, prices, nav, `Quick Add` button, footer background, secondary button border + label |
| `gold` | `#D4AF37` | `text-gold` / `bg-gold` | Accent — see "Gold is punctuation" above |
| `surface` | `#FFFFFF` | `bg-surface` | Default page and card background |
| `surface-muted` | `#F8FAFC` | `bg-surface-muted` | Alternating section bands, review cards, newsletter band |
| `border` | `#E2E8F0` | `border-border` | The **only** border colour. 1px, everywhere |
| `body` | `#475569` | `text-body` | Paragraph copy, card sub-labels, rating count |
| `muted` | `#94A3B8` | `text-muted` | Footer links, footer copyright, placeholder text, payment glyphs |

### 3.2 Support tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `gold-subtle` | `rgba(212,175,55,0.10)` | FeatureCard icon tile fill (48px circle). Exported at `fill-opacity: 0.101961` on desktop / `0.0823529` on tablet — use **10%**. |
| `verified-bg` | `#D1FAE5` | `VERIFIED` pill background on ReviewCard |
| `verified-fg` | `#065F46` | `VERIFIED` pill text |
| `footer-chip` | `#1E293B` | Payment-method chip background in the footer |
| `overlay` | `linear-gradient(to top, rgba(17,24,39,.72), transparent 55%)` | Scrim under text on CategoryCard and wide NewArrival cards |

### 3.3 Rules

1. **Never introduce a colour that is not in this table.** Need a new state? Derive it from `ink` or `gold` with opacity.
2. Gold text on white is `#D4AF37` on `#FFFFFF` = **2.4:1** — it is **decorative only**. Never use gold for body copy, form labels, error text, or any text that carries meaning not repeated elsewhere. Eyebrows are permitted because they duplicate the adjacent `<h2>`.
3. Gold as a *background* with `ink` text (`#111827` on `#D4AF37` = **8.9:1**) is fully accessible — this is why primary buttons are gold-filled with dark text.
4. Do not use Tailwind's default palette names (`slate-200`, `gray-900`) in components. Always use the semantic aliases so a rebrand is a one-file change.

---

## 4. Typography

### 4.1 Families

| Role | Family | Weights loaded | Notes |
| --- | --- | --- | --- |
| **Primary** | `Outfit` | 300, 400, 500, 600, 700, 800 | Headings **and** body. Confirmed from the brand spec ("Outfit Sans Geometric") and by glyph inspection of the mockups (double-storey `a`, straight-tail `y`, single-storey `g`). |
| **Mono / annotation** | `Geist Mono` (fallback: `JetBrains Mono`, `ui-monospace`) | 400, 500 | Eyebrow labels, `VERIFIED` pill, `NEW` / `BEST SELLER` badges. The brand spec names "Geist Mono Precision". |

Load both with `next/font/google`, expose as `--font-outfit` / `--font-mono`, and set
`font-outfit` as the `body` default. Never use a third family.

### 4.2 Type scale (desktop / 1920 reference)

Sizes were derived from measured ink heights in `knb-desktop-homepage.png`, then **corrected by
rendering and re-measuring glyph widths against the reference**. Cap-height alone suggested 75px
for `display`; the rendered word "Carry Confidence." measured 634px against the reference's 613px,
so the true size is 73px (Outfit's cap ratio is ~0.727, not the 0.70 assumed during analysis).
Treat the **Measured** column as ground truth and pixel-diff any new token the same way.

| Token | Size / line-height | Weight | Colour | Measured ink | Used for |
| --- | --- | --- | --- | --- | --- |
| `display` | **73px** / 99px (1.36) | 800 | `ink`, line 2 `gold` | cap 52.5px, baseline pitch 99px | Hero `<h1>` |
| `h2` | 42px / 1.15 | 800 | `ink` | cap 30px | All section headings |
| `h2-plain` | 36px / 1.2 | 800 | `ink` | ink 27px | "Join the Nation" (newsletter — no eyebrow above it) |
| `h3-banner` | 48px / 1.15 | 800 | `#FFFFFF` | ink ~37px | Promo banner headline |
| `eyebrow` | 12px / 18px, `tracking-[0.12em]`, uppercase | 500 mono | `gold` | cap 8px | Section eyebrow labels |
| `lead` | 18px / 30px | 400 | `body` | ink 18px, pitch 30px | Hero paragraph, newsletter sub-copy |
| `body` | 16px / 26px | 400 | `body` | ink 14.5px, pitch 24px (reviews) | Review quotes, general prose |
| `body-sm` | 14px / 21px | 400 | `body` / `muted` | ink 13px, pitch 21px | Feature descriptions, footer brand copy, reviewer role |
| `nav` | 15px / 1 | 500 | `ink` (active: `gold`) | ink 13px | Header navigation |
| `card-title` | 18px / 1.2 | 700 | `ink` | ink 17px | ProductCard title |
| `card-price` | 24px / 1.1 | 700 | `ink` | ink 17.5px | ProductCard price |
| `btn` | 16px / 1 | 600 | contextual | ink 15px | Primary / secondary button labels |
| `btn-sm` | 14px / 1 | 600 | `#FFFFFF` | — | `Quick Add` label |
| `footer-heading` | 16px / 1.2 | 700 | `#FFFFFF` | ink 12.5px | Footer column headings |
| `footer-link` | 15px / 28px pitch | 400 | `muted` | ink 10–13px | Footer links |
| `micro` | 11px, `tracking-[0.1em]`, uppercase | 500 mono | contextual | — | `VERIFIED`, `NEW`, `BEST SELLER` badges |

### 4.3 Responsive type

Only these tokens change across breakpoints. Everything else is fixed.

| Token | Mobile (<768) | Tablet (768–1279) | Desktop (≥1280) |
| --- | --- | --- | --- |
| `display` | 32px / 1.2 | 56px / 1.25 | 75px / 1.32 |
| `h2` | 24px / 1.2 | 34px / 1.15 | 42px / 1.15 |
| `h3-banner` | 24px / 1.25 | 36px / 1.2 | 48px / 1.15 |
| `lead` | 16px / 26px | 17px / 28px | 18px / 30px |
| `card-price` | 20px | 22px | 24px |

Implement with Tailwind responsive prefixes on a shared class, **not** by branching markup.

### 4.4 Rules

1. Headings are always weight **800**. There is no 900 in this system.
2. Never set `letter-spacing` on Outfit except where a token specifies it. Mono tokens always carry tracking.
3. Never centre body copy longer than two lines except inside the promo banner and newsletter, which are centred by design.
4. `text-wrap: balance` on all `<h1>`/`<h2>`; `text-wrap: pretty` on lead paragraphs.

---

## 5. Spacing System

Base unit **4px**. Use Tailwind's default scale; the values below are the ones this design actually uses.

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 100`

### 5.1 Section rhythm

| Property | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Section padding-block | **100px** | 72px | 48px |
| Eyebrow → `<h2>` | 16px | 14px | 12px |
| `<h2>` → content | 40px | 32px | 24px |
| Grid gap (cards) | **24px** | 16px | 12px |
| Grid gap (Instagram) | 12px | 12px | 12px |

> The desktop mockup's New Arrivals section appears to end 40px after its last card rather than 100px.
> That is a clipping artifact in the export (the 3-column cards are visibly cut off mid-price).
> **Use 100px.** See §14.

### 5.2 Card internals

| Property | Value |
| --- | --- |
| ProductCard padding | 16px (desktop/tablet) · 12px (mobile) |
| Image → rating row | 24px |
| Rating → title | 14px |
| Title → price row | 12px |
| FeatureCard padding | 24px |
| ReviewCard padding | 32px (desktop) · 24px (tablet/mobile) |

---

## 6. Grid & Container

### 6.1 Container

```
max-width : 1760px   (content box)
page gutter: 80px @ ≥1280 · 48px @ 768–1279 · 16px @ <768
```

At the 1920px reference width this produces content spanning **x = 80 → 1840**, which matches every
measured section edge in the desktop mockup.

Implement once, in `components/layout/Container.jsx`:

```
w-full mx-auto max-w-[1920px] px-4 md:px-12 xl:px-20
```

(`1920 − 2×80 = 1760` ✓ · `1024 − 2×48 = 928` ✓ · `390 − 2×16 = 358` ✓ — all three match the mockups.)

**Two elements are exempt** and must be rendered outside `<Container>`:
- **PromoBanner** — full viewport width, image bleeds edge to edge.
- **InstagramStrip** — full viewport width with a fixed `32px` gutter on desktop (`px-8`), inside the normal container on tablet/mobile.

### 6.2 Column counts

| Section | Desktop ≥1280 | Tablet 768–1279 | Mobile <768 |
| --- | --- | --- | --- |
| Hero | 2 (text + 680px image) | 2 (text + 420px image) | 1 (image first, then text) |
| Shop by Category | 4 × 2 | 4 × 2 | horizontal scroll row |
| Featured Collection | 4 | 3 | 2 |
| Brand Promise | 5 | 5 | 2 |
| Best Sellers | 4 | 3 | 1 |
| New Arrivals — wide | 2 | 2 | 1 |
| New Arrivals — standard | 3 | 3 | 2 |
| Reviews | 3 | 2 | 1 |
| Instagram | 6 | 4 | 3 × 2 |
| Footer | 4 (brand 2fr + 3 × 1fr) | 4 | 1 (stacked) |

### 6.3 Verified desktop measurements

Every number below was read directly from `knb-desktop-homepage.png` at 1× (the file is 2× DPR).

| Element | x | width | Derivation |
| --- | --- | --- | --- |
| Container | 80 → 1840 | 1760 | — |
| Product card | — | **422** | 4 × 422 + 3 × 24 = 1760 ✓ |
| Product image | — | **390 × 280** | 422 − 2 × 16 padding ✓ (matches source asset) |
| FeatureCard | — | **332.8** | 5 × 332.8 + 4 × 24 = 1760 ✓ |
| NewArrival wide card | — | **868 × 360** | 2 × 868 + 24 = 1760 ✓ (matches source asset) |
| NewArrival standard card | — | **570.67** | 3 × 570.67 + 2 × 24 = 1760 ✓ |
| NewArrival standard image | — | **539 × 280** | 570.67 − 2 × 16 ✓ (matches source asset) |
| ReviewCard | — | **570.67** | same 3-up grid |
| CategoryCard | — | **428** | 4 × 428 + 3 × 24 = 1760 ✓ |
| Instagram tile | 32 → 1888 | **299.33 × 220** | 6 tiles + 5 × 12 gap in `100vw − 64` ✓ |
| Hero image | 1160 → 1840 | **680 × 520** | matches source asset ✓ |
| Newsletter form | 710 → 1210 | **500** | input 357 + gap 13 + button 130 |

**Never hard-code these pixel widths in components.** They are the *outcome* of
`container width` + `column count` + `24px gap`. Express them as `grid-cols-*` + `gap-6`.

### 6.4 Vertical section map (desktop, 1× px)

Total page height **7165px**. Use this to verify a pixel-diff during implementation.

| # | Section | y start | y end | Height | Background |
| --- | --- | --- | --- | --- | --- |
| 1 | Header | 0 | 80 | 80 | `#FFFFFF`, `border-b #E2E8F0` |
| 2 | Hero | 80 | 906 | 826 | `#FFFFFF` |
| 3 | Shop by Category | 906 | 1786 | 880 | `#FFFFFF` |
| 4 | Featured Collection | 1786 | 2552 | 766 | `#F8FAFC` |
| 5 | Brand Promise | 2553 | 2996 | 443 | `#F8FAFC`, `border-t #E2E8F0` at y2552 |
| 6 | Best Sellers | 2997 | 3783 | 786 | `#FFFFFF` |
| 7 | New Arrivals | 3783 | 4873 | 1090 | `#F8FAFC` |
| 8 | Promo Banner | 4873 | 5353 | **480** | full-bleed image |
| 9 | Reviews | 5353 | 5990 | 637 | `#FFFFFF` |
| 10 | Instagram | 5990 | 6382 | 392 | `#FFFFFF` |
| 11 | Newsletter | 6382 | 6761 | 379 | `#F8FAFC` |
| 12 | Footer | 6761 | 7165 | 404 | `#111827` |

Sections 4 and 5 share one `#F8FAFC` band separated by a hairline, **not** by padding.
Sections 9 and 10 share one white band with no divider.

---

## 7. Breakpoints

| Name | Range | Tailwind | Reference mockup |
| --- | --- | --- | --- |
| Mobile | 0 – 767 | (base) | `knb-mobile-homepage.png` @ 390px |
| Tablet | 768 – 1279 | `md:` | `knb-tablet-homepage.png` @ 1024px |
| Desktop | 1280 – ∞ | `xl:` | `knb-desktop-homepage.png` @ 1920px |

`sm:` (640) and `lg:` (1024) exist in Tailwind but **are not design breakpoints**. Use them only for
intermediate grid smoothing (e.g. `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4`), never to change
content or component composition.

Mobile-first always: write the base style for mobile, add `md:` and `xl:` on top.

Full behavioural spec: [`responsive.md`](./responsive.md).

---

## 8. Border Radius

| Token | Value | Applied to |
| --- | --- | --- |
| `rounded-badge` | 6px | `NEW`, `BEST SELLER`, `VERIFIED` pills; payment chips |
| `rounded-media` | 12px | Product images inside cards |
| `rounded-card` | **14px** | ProductCard, FeatureCard, ReviewCard, CategoryCard, NewArrival wide card, Instagram tile |
| `rounded-hero` | 16px | Hero image |
| `rounded-full` | 9999px | All buttons, wishlist button, newsletter input, category circles (mobile), cart badge |

Measured: the card corner curve spans 13px from tangent to tangent (antialiasing accounts for ~1px), so **14px**.
Registered as `--radius-*` in the `@theme` block of `app/globals.css` — do not use `rounded-xl`/`rounded-2xl` literals.

---

## 9. Shadow System

**There are no shadows in this design.** The reference contains zero `box-shadow`.

Elevation is expressed exclusively as:

| Level | Treatment |
| --- | --- |
| 0 — flush | Same background, no border (section content) |
| 1 — card | `bg-surface` + `border border-border` (1px `#E2E8F0`) |
| 2 — floating | `bg-white` + `rounded-full` (wishlist button, mobile bottom nav) |

The single permitted exception is the **mobile bottom navigation**, which floats over content and
needs separation from the page beneath it:
`shadow-[0_-1px_24px_rgba(17,24,39,0.10)]`. Do not use it anywhere else.

**Do not add hover shadows.** See §13 for the approved hover treatments.

---

## 10. Components — Visual Specification

Component APIs and file locations live in [`components.md`](./components.md). This section defines only how they *look*.

### 10.1 Buttons

| Variant | Height | Padding-x | Background | Text | Border | Radius |
| --- | --- | --- | --- | --- | --- | --- |
| `primary` | 52px | 32px | `gold` | `ink`, 16/600 | none | full |
| `secondary` | 52px | 32px | transparent | `ink`, 16/600 | 2px `ink` | full |
| `dark` | 32px | 20px | `ink` | `#FFFFFF`, 14/600 | none | full |
| `ghost` | 40px | 0 | transparent | `ink`, 15/500 | none | — |

- `primary` and `secondary` are the hero pair and the promo-banner CTA.
- `dark` is `Quick Add` on ProductCard.
- Mobile: `primary`/`secondary` become **full-width, 52px, stacked with a 12px gap**.
- Newsletter `Subscribe` is `primary` at **50px** height, 130px wide.

### 10.2 ProductCard

```
┌─ 422 × 440 ────────────────────────────┐
│  border 1px #E2E8F0 · radius 14 · #FFF │
│  padding 16                            │
│  ┌─ image 390 × 280 · radius 12 ─────┐ │
│  │                        ┌────────┐ │ │  wishlist: 34px white circle,
│  │  [NEW]                 │  ♡     │ │ │  inset 12px from image edge
│  │  badge inset 12                  │ │ │  icon: heart-off, 16px, ink
│  └──────────────────────────────────┘ │
│  ↕ 24                                  │
│  ★★★★★ (5.0)      14px gold stars      │
│  ↕ 14                                  │
│  Executive Messenger   18/700 ink      │
│  ↕ 12                                  │
│  $219                  ┌────────────┐  │
│  24/700 ink            │  Quick Add │  │  dark pill 32px
│                        └────────────┘  │
└────────────────────────────────────────┘
```

- Rating: five 14px stars (`star.svg` geometry = Lucide `star`), gold stroke, filled for whole
  values. The numeric `(5.0)` is `body-sm` in `body` colour.
- **The wishlist icon in the reference is `heart-off` (a crossed-out heart), not `heart`.**
  This is almost certainly a Figma slip. **Use `heart` (outline) for the default state and
  `heart` filled `gold` for the active state.** Documented deviation — see §14.
- Badge (`NEW` / `BEST SELLER`) sits top-left of the image, 12px inset, `micro` type,
  `rounded-badge`. `NEW` = `bg-gold` + `text-ink`. `BEST SELLER` = `bg-ink` + `text-white`.
- Only one badge renders at a time; `NEW` wins.

### 10.3 CategoryCard

- Ratio **11 : 8** (matches the tablet mockup's 220 × 160 tiles). Desktop 428 × 311.
- Full-bleed image, `rounded-card`, `overflow-hidden`.
- Bottom-left label: `#FFFFFF`, 16/700, plus a 16px gold `arrow-right`, both inset 20px (12px on mobile).
- Scrim: `overlay` gradient so the label always clears 4.5:1 against the photo.

### 10.4 FeatureCard (Brand Promise)

- `bg-surface`, `border`, `rounded-card`, padding 24px.
- Icon tile: 48px circle, `bg-gold-subtle` (10% gold), containing a 22px gold Lucide icon.
- Icon → title 20px · title (16/700 `ink`) → description 6px · description `body-sm` `body`.
- Icons in order: `shield-check`, `truck`, `refresh-cw`, `lock`, `badge-check`.

### 10.5 ReviewCard

- `bg-surface-muted`, `border`, `rounded-card`, padding 32px.
- Five 16px gold stars → 24px → quote (`body`, `body` colour, curly quotes) → 28px → name row.
- Name row: name (16/700 `ink`) + 8px + `VERIFIED` pill (`micro`, `verified-bg`/`verified-fg`, `rounded-badge`, px 8 py 3).
- Role beneath: `body-sm`, `body` colour.
- Cards in the reference are content-height (`items-start`). **Use `items-stretch` so all three
  cards in a row are equal height** — documented deviation, see §14.

### 10.6 Banner (promo)

- Full-bleed, fixed **480px** height on desktop (360px tablet, 240px mobile).
- Background image `object-cover object-center` + `bg-ink/45` scrim.
- Centred stack: `h3-banner` white → 16px → sub-copy (`lead`, `gold`) max-width 640px → 24px → `primary` button.

### 10.7 Newsletter

- Band `bg-surface-muted`, 100px padding-block.
- Centred: `h2-plain` → 12px → `lead` (max-width 620px) → 32px → form.
- Form: 500px wide row. Input 357 × 50, `bg-white`, `border`, `rounded-full`, px 24, placeholder `muted`.
  Gap 13px. Button `primary` 130 × 50.
- Mobile: input and button stack full-width, 12px gap.

### 10.8 Forms (general)

| Property | Value |
| --- | --- |
| Height | 50px (48px on mobile) |
| Background | `#FFFFFF` |
| Border | 1px `border`; focus → 1px `ink` |
| Radius | `rounded-full` for single-line inputs; `rounded-card` for textareas |
| Padding-x | 24px |
| Text | `body` 16px `ink`; placeholder `muted` |
| Focus ring | `ring-2 ring-gold ring-offset-2` |
| Error | Border `#B91C1C`, message `body-sm` `#B91C1C` beneath, `aria-describedby` wired |

Never remove the focus ring. Never rely on placeholder text as the label.

---

## 11. Header

| Property | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Height | **80px** | 80px | **56px** |
| Background | `#FFFFFF` | same | same |
| Bottom border | 1px `border` | same | same |
| Position | sticky top-0, z-50 | same | same |
| Layout | logo left · nav centre · actions right | same | menu left · logo centre · actions right |

- **Logo lockup:** 38px monogram + 12px gap + wordmark. `KNOCK NATION` in Outfit 800 / 16px /
  `tracking-[0.02em]` `ink`, with `BAG` beneath in mono 9px / `tracking-[0.3em]` `gold`.
- **Nav:** `Home · Shop · Men · Women · Travel · Backpacks · Collections · About`.
  `nav` type, 28px gap. Active item is `gold`. Hover: `ink → gold`, 150ms.
  These eight items are canonical at **every** breakpoint (the tablet mockup shows five —
  see §14). On tablet the nav collapses into the drawer if it would overflow.
- **Actions:** `search`, `heart`, `user`, `shopping-bag` — 22px Lucide icons, `ink`, 20px gap.
  Cart carries an 18px `gold` circle badge with `ink` 11px/700 count, offset to the top-right.
- **Mobile:** hamburger (24px) left, centred logo lockup, then `search` + `shopping-bag` only.
  `heart` and `user` move to the bottom navigation.

---

## 12. Footer

- Background `ink`, padding-block 64px, **404px** tall on desktop.
- Grid: `2fr 1fr 1fr 1fr` — brand block, then `Quick Links`, `Customer Service`, `Policies`.
- Brand block: white monogram (`kn-monogram-white.svg`) + wordmark in white, then `body-sm`
  description in `muted`, max-width 340px.
- Column heading: `footer-heading` white. Links: `footer-link` `muted`, **28px line pitch**, hover → `#FFFFFF`.
- Divider: 1px `rgba(226,232,240,0.12)` above the bottom bar.
- Bottom bar (three-up): copyright `body-sm` `muted` left · payment chips centre · social icons right.
  - Payment chips: 38 × 26, `rounded-badge`, `bg-footer-chip`, `muted` glyph.
  - Socials: `instagram`, `facebook`, `twitter`, `youtube` — 20px Lucide, `muted`, hover `#FFFFFF`.
- Mobile: single column, everything left-aligned except the payment chips and copyright, which centre.
  Add **`padding-bottom: 96px`** so the floating bottom nav never covers footer links.

---

## 13. Animation Rules

Restraint is the rule. This is a premium brand, not a playground.

| Interaction | Treatment | Duration | Easing |
| --- | --- | --- | --- |
| Link / nav hover | colour → `gold` | 150ms | `ease-out` |
| Button hover | `primary` → `brightness-95`; `secondary` → `bg-ink text-white`; `dark` → `bg-ink/90` | 150ms | `ease-out` |
| Card hover | `border-color` → `#CBD5E1` **only** | 200ms | `ease-out` |
| Card image hover | `scale(1.03)` inside `overflow-hidden` | 400ms | `ease-out` |
| Wishlist toggle | icon fill + `scale(1.15)` then settle | 180ms | `ease-out` |
| Mobile drawer | slide from left | 250ms | `cubic-bezier(.4,0,.2,1)` |
| Section reveal | `opacity 0→1`, `translateY(16px→0)`, once, on intersect | 500ms | `ease-out` |

**Hard rules**

1. No parallax, no auto-playing carousels, no marquee, no bounce, no spring overshoot.
2. Never animate `width`, `height`, `top` or `left`. Only `transform`, `opacity`, `color`,
   `background-color`, `border-color`, `filter`.
3. Every animation must be wrapped:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: .01ms !important;
       transition-duration: .01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
4. Section reveals must never gate content on JS — render visible by default, animate as an enhancement.

---

## 14. Reconciled Deviations from the Mockups

The three mockups were generated separately and contradict each other. These decisions are **final**
and were confirmed with the project owner. Do not "fix" the code back toward a mockup.

| # | Mockup shows | Decision | Why |
| --- | --- | --- | --- |
| 1 | Desktop "Shop by Category" = one full-width 1760 × 680 card (Accessories) | **4 × 2 grid of all 8 categories** at every breakpoint | All 8 source assets are exactly 1760 × 680 and the tablet mockup shows a 4 × 2 grid of 8. The desktop export has all 8 slides stacked, with the last painting on top. |
| 2 | Tablet drops the 4th product in every row, the 3rd review, 2 Instagram tiles, 3 nav links | **Desktop content is canonical everywhere** | Owner's rule: identical content at all breakpoints, layout-only changes. |
| 3 | Mobile renames sections ("Why Choose Us", "What They Say"), drops the 5th promise item and both wide New Arrival cards | **Desktop wording and full content everywhere** | Same rule as #2. |
| 4 | Mobile uses `Add`, single-star rating, circular category scroller | **`Quick Add` and 5-star rating everywhere**; the circular scroller **is** kept — it is a layout choice, not a content change | Content parity applies to content, not to how a grid reflows. |
| 5 | Desktop New Arrivals 3-column cards are cut off mid-price | **Render full 440px cards, 100px section padding** | Overflow-clip artifact; the tablet mockup renders the same cards complete. |
| 6 | Ratings differ between mockups (Quantum Pack 4.0 vs 4.8, Meridian 5.0 vs 4.9) | **Desktop values win** | Single source of truth in `data/products.js`. |
| 7 | Wishlist icon is `heart-off` (crossed-out heart) | **Use `heart`** | A crossed-out heart signals "remove from wishlist" and is wrong as a default state. |
| 8 | Review cards are unequal height (`items-start`) | **Equal height (`items-stretch`)** | Ragged card bottoms in a 3-up row read as a bug. |
| 9 | Tablet promo banner uses a different photo (airport) from desktop (street) | **One image at all breakpoints** (`promo-crafted.webp`) | Content parity. The airport shot is kept as `promo-crafted-alt.webp`. |
| 10 | Footer link reads "Warranty" on tablet, "Warranty Coverage" on desktop | **"Warranty Coverage"** | Desktop is canonical. |

---

## 15. Image Rules

1. **Always `next/image`.** Never a bare `<img>`, never a CSS `background-image` for content imagery.
2. Every image needs an explicit `width`/`height` **or** `fill` inside a `relative` parent with a
   fixed aspect ratio. No exceptions — this is what prevents CLS.
3. `sizes` is mandatory whenever `fill` is used. Match the grid:
   ```jsx
   sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
   ```
4. `priority` on exactly **one** image per page — the hero. Everything else lazy-loads by default.
5. `alt` describes the product or scene ("Executive Messenger black leather satchel"), never
   "image" or "photo". Decorative imagery gets `alt=""`.
6. **Media sizing is by fixed height, not aspect ratio** — verified during implementation.
   The reference holds image *height* constant per breakpoint and lets *width* follow the column
   count: a 4-up product image is `390 × 280` while a 3-up is `539 × 280`. Both are 280 tall.
   A fixed aspect ratio makes wider cards taller and breaks the grid.

   | Slot | Mobile | Tablet | Desktop | Class |
   | --- | --- | --- | --- | --- |
   | Product card image | 160 | 220 | 280 | `h-40 md:h-[220px] xl:h-[280px]` |
   | New arrival (wide) card | 180 | 220 | 360 | `h-[180px] md:h-[220px] xl:h-[360px]` |
   | Instagram tile | 140 | 180 | 220 | `h-[140px] md:h-[180px] xl:h-[220px]` |
   | Promo banner | 240 | 360 | 480 | `h-[240px] md:h-[360px] xl:h-[480px]` |
   | Hero image | 300 | 340 | 520 | `h-[300px] md:h-[340px] xl:h-[520px]` |

   Category cards are the one genuine ratio, because the reference keeps 11:8 at every breakpoint
   (220 × 160 tablet, 428 × 311 desktop): `aspect-[11/8]`.

7. Source assets are WebP. See [`assets.md`](./assets.md) for provenance and naming.

---

## 16. Accessibility Baseline

Full spec in [`accessibility.md`](./accessibility.md). The design-level obligations are:

- Body text (`#475569` on `#FFFFFF`) = **7.5:1**. Muted text (`#94A3B8`) is used **only** on the
  `#111827` footer, where it measures **6.4:1**. Never put `muted` on white.
- Gold text on white is decorative only (§3.3).
- Every interactive target is ≥ **44 × 44px** in its hit area, even when the visual is smaller
  (the 34px wishlist button gets padding to reach 44px).
- Focus is always visible: `ring-2 ring-gold ring-offset-2 ring-offset-white`.
- Icon-only controls carry `aria-label`. The cart count is announced as
  `aria-label="Cart, 3 items"`, not as a bare "3".
- Section order in the DOM is the reading order at every breakpoint. Never use `order-*` to
  reorder meaningful content — the only permitted use is the mobile hero, where the image
  legitimately precedes the copy in the design **and** is marked up in that order.

---

## 17. Component Naming Rules

- Files and components: `PascalCase.jsx`, one component per file, default export matching the filename.
- Directory decides scope — `common/` (used in 3+ places) · `layout/` (chrome) · `home/` (page-specific
  sections) · `product/` (commerce primitives) · `ui/` (unstyled primitives).
- Name by **role**, never by appearance or position: `ProductCard` not `WhiteCard`,
  `SectionHeader` not `CenteredTitle`, `PromoBanner` not `BigImageBlock`.
- Section components end in the section's noun: `HeroSection`, `CategorySection`, `ReviewSection`.
- Boolean props read as assertions: `isActive`, `hasBadge`, `showArrow`.
- Handlers are `onX`; internal handlers are `handleX`.
- No component may exceed **150 lines**. Past that, extract a subcomponent.

---

## 18. Future Page Consistency Rules

Every new page must, without exception:

1. Compose from `<Container>`, `<Section>` and `<SectionHeader>` — never hand-roll padding or a max-width.
2. Alternate `surface` / `surface-muted` bands in the same rhythm as the homepage.
3. Reuse `ProductCard`, `CategoryCard`, `Button`, `Badge`, `Rating`. If a variant is needed, **add a
   prop to the existing component** — never fork it.
4. Use only tokens from §3, §4, §5 and §8. A raw hex, a raw `px` font-size or a magic-number margin
   in a component is a review failure.
5. Open with a `SectionHeader` (eyebrow + `h2`) unless the page opens with a hero.
6. Ship the same header, footer and mobile bottom navigation.
7. Carry the same content at every breakpoint (§14, rule 2).
8. Meet §16 before merge.

**When this document and a mockup disagree, this document wins. When this document is silent,
ask — do not invent.**
