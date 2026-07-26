# Responsive Strategy

> **The governing rule: content is identical at every breakpoint. Only layout changes.**
>
> Nothing is hidden, dropped, truncated, renamed or reordered between desktop, tablet and mobile.
> If a product, section, review, link or feature exists on desktop, it exists on mobile.
> The three reference mockups violate this in several places; those conflicts are resolved in
> [`design.md` §14](./design.md#14-reconciled-deviations-from-the-mockups) and the resolution is binding.

---

## 1. Breakpoints

| Name | Range | Tailwind prefix | Reference | Container |
| --- | --- | --- | --- | --- |
| Mobile | 0 – 767 | base (no prefix) | 390px | 358px (16px gutter) |
| Tablet | 768 – 1279 | `md:` | 1024px | 928px (48px gutter) |
| Desktop | 1280+ | `xl:` | 1920px | 1760px (80px gutter, capped at 1920px) |

`sm:` (640) and `lg:` (1024) are **not** design breakpoints. Use them only to smooth a grid between
the three real tiers — never to change what is on the page.

Mobile-first, always. Write the mobile style unprefixed, then layer `md:` and `xl:` on top.
`max-*` variants are not permitted.

---

## 2. The Three Permitted Kinds of Change

| # | Allowed | Example |
| --- | --- | --- |
| 1 | **Column count** | 4-up grid → 3-up → 2-up |
| 2 | **Spacing / type scale** | `py-25` → `py-18` → `py-12` |
| 3 | **Presentation of the same content** | Category tiles → circular horizontal scroller; nav links → drawer |

### Forbidden

- `hidden md:block` / `xl:hidden` wrapped around *content* (a product, a review, a section, a link).
  Wrapping a purely presentational duplicate is fine only if both copies carry identical content and
  one is `aria-hidden`.
- Slicing an array by breakpoint (`products.slice(0, 3)` on tablet).
- Different headings, labels or button text per breakpoint.
- Rendering different components per breakpoint via a JS width check. Use CSS.
- `order-*` on meaningful content, except the mobile hero (§4.2), where the image genuinely precedes
  the copy in both the design and the DOM.

---

## 3. Global Layout

| Element | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Container gutter | 16px | 48px | 80px |
| Content width | 358 | 928 | 1760 |
| Section padding-block | 48px | 72px | 100px |
| Card grid gap | 12px | 16px | 24px |
| Section header align | **left** | centre | centre |
| Header height | 56px | 80px | 80px |
| Bottom navigation | **visible** | hidden | hidden |
| Footer bottom padding | 96px (clears bottom nav) | 64px | 64px |

---

## 4. Section-by-Section Behaviour

### 4.1 Header

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Layout | hamburger · centred logo · actions | logo · nav · actions | logo · nav · actions |
| Nav links | in slide-in drawer | inline (drawer if it overflows) | inline, 28px gap |
| Actions shown | Search, Cart | Search, Wishlist, Account, Cart | Search, Wishlist, Account, Cart |

All **eight** nav items (`Home · Shop · Men · Women · Travel · Backpacks · Collections · About`)
exist at every breakpoint. On mobile they live in the drawer; Wishlist and Account move to the
bottom navigation. Nothing is removed from the site — it is relocated within the same page, and both
locations are reachable.

### 4.2 Hero

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Layout | 1 column, **image first** | 2 columns (text 55% / image 420px) | 2 columns (text / image 680px) |
| Image | full-bleed, 300px tall, square-cut | 420 × 340, `rounded-hero` | 680 × 520, `rounded-hero` |
| Headline | 32px / 1.2 | 56px / 1.25 | 75px / 1.32 |
| Paragraph | 16 / 26 | 17 / 28 | 18 / 30 |
| Buttons | stacked, full width, 52px, 12px gap | inline, 16px gap | inline, 16px gap |

Both button labels (`Shop Collection`, `Explore New Arrivals`) are identical everywhere.

### 4.3 Shop by Category — 8 items

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Layout | horizontal scroller | 4 × 2 grid | 4 × 2 grid |
| Card | `circle` variant — 64px round image, label beneath | `tile` — 11:8, scrim, label + arrow | `tile` — 428 × 311 |
| Gap | 16px | 16px | 24px |

All eight categories render in all three layouts. The mobile scroller must:
- use `overflow-x-auto` + `snap-x snap-mandatory`, never a JS carousel;
- extend edge-to-edge with `-mx-4 px-4` so the first and last tiles align to the gutter;
- expose `scroll-snap-align: start` per item and stay keyboard-scrollable;
- hide the scrollbar visually but keep the region focusable.

### 4.4 Featured Collection & Best Sellers — 4 products each

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Columns | 2 | 3 | 4 |
| Rows | 2 | 2 (3 + 1) | 1 |

On tablet the fourth product **wraps to a second row**. The tablet mockup shows only three because
the export clipped the overflow — do not replicate that.

### 4.5 Brand Promise — 5 features

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Columns | 2 (3 rows: 2 + 2 + 1) | 5 | 5 |
| Card padding | 20px | 20px | 24px |
| Icon tile | 40px | 44px | 48px |

All five items, with desktop wording, at every breakpoint:
`Premium Quality` · `Fast Delivery` · `Easy Returns` · `Secure Payments` · `Warranty`.
The section heading is `Our Brand Promise` everywhere (the mobile mockup's "Why Choose Us" and its
shortened labels are not used).

### 4.6 New Arrivals — 2 wide + 3 standard

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Wide cards | 1 column | 2 columns | 2 columns (868 × 360) |
| Standard cards | 2 columns (2 + 1) | 3 columns | 3 columns |

The mobile mockup omits the two wide cards entirely; they are restored. Both blocks render at every
breakpoint.

### 4.7 Promo Banner

Full-bleed at every breakpoint, one image (`promo-crafted.webp`), `object-cover`.

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Height | 240px | 360px | 480px |
| Headline | 24px | 36px | 48px |
| Sub-copy | shown, 15px | shown, 16px | shown, 18px |

Full desktop sub-copy everywhere: _"A marriage of geometric structure and uncompromising utility.
Engineered for active world-class travel."_ (the mobile mockup's shortened line is not used).

### 4.8 Reviews — 3 reviews

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Columns | 1 (stacked) | 2 (2 + 1) | 3 |
| Padding | 24px | 24px | 32px |
| Heading | `What Our Customers Say` | same | same |
| Names | full (`Marcus Sterling`) | full | full |

Grid uses `items-stretch` so cards in a row match height.

### 4.9 Instagram — 6 tiles

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Layout | 3 × 2 grid | 4 + 2 grid | 6 in a row |
| Container | standard (16px gutter) | standard (48px gutter) | **full-bleed, 32px gutter** |
| Gap | 12px | 12px | 12px |

Desktop is the only breakpoint where this strip breaks the container.

### 4.10 Newsletter

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Form | stacked, full width, 12px gap | inline, 500px | inline, 500px (357 + 13 + 130) |
| Input height | 48px | 50px | 50px |
| Heading | 24px | 30px | 36px |

### 4.11 Footer

| | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Columns | 1, stacked | 4 (`2fr 1fr 1fr 1fr`) | 4 (`2fr 1fr 1fr 1fr`) |
| Bottom bar | stacked, centred | 3-up row | 3-up row |
| Padding-bottom | **96px** | 64px | 64px |

All three link columns (`Quick Links`, `Customer Service`, `Policies`) and every link render on
mobile. The mobile mockup drops the Policies column; that is not reproduced.

### 4.12 Mobile Bottom Navigation

Mobile only (`md:hidden`). Five items: **Home · Categories · Wishlist · Cart · Profile**.

- `fixed bottom-4 inset-x-4`, white, `rounded-full`, `z-50`, the single permitted shadow.
- Icon 22px above a 11px label. Active item gold, inactive `ink`.
- Labels always visible — never icon-only.
- Respects `env(safe-area-inset-bottom)`.
- This is the only component in the project that exists at one breakpoint and not another. It is an
  additional *navigation surface*, not additional *content* — every destination it offers is also
  reachable from the header drawer and the footer.

---

## 5. Implementation Patterns

**Correct — one tree, responsive classes:**

```jsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-6">
  {products.map((p) => <ProductCard key={p.id} {...p} />)}
</div>
```

**Wrong — content differs by breakpoint:**

```jsx
<div className="hidden xl:grid xl:grid-cols-4">{products.map(...)}</div>
<div className="grid xl:hidden grid-cols-3">{products.slice(0, 3).map(...)}</div>
```

**Correct — same content, different presentation:**

```jsx
{/* Mobile: snap scroller. Tablet+: grid. One data source, one card component. */}
<div className="flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-4 px-4
                md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0
                xl:gap-6">
  {categories.map((c) => (
    <CategoryCard
      key={c.slug}
      {...c}
      className="w-20 shrink-0 snap-start md:w-auto"
      variant="circle"            /* CSS switches the visual at md: */
    />
  ))}
</div>
```

---

## 6. Testing Checklist

Verify at **390 · 768 · 1024 · 1280 · 1440 · 1920** and at 2560 (container caps, no stretch).

- [ ] The same number of products, categories, features, reviews and Instagram tiles at every width
- [ ] Identical headings, labels and button text at every width
- [ ] No horizontal scrollbar at any width, including 320px
- [ ] Container gutters measure 16 / 48 / 80px
- [ ] Bottom nav appears **only** below 768px and never covers footer content
- [ ] Category scroller is reachable and operable by keyboard
- [ ] Text reflows without clipping at 200% browser zoom
- [ ] Tap targets ≥ 44 × 44px on mobile
- [ ] Section padding-block measures 48 / 72 / 100px
- [ ] No layout shift on load (CLS = 0) — every image has fixed dimensions
