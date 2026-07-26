# Accessibility

> **Target: WCAG 2.2 Level AA.** These are requirements, not aspirations. A PR that fails any
> "Must" below does not merge.

---

## 1. Colour & Contrast

Measured against the palette in [`design.md` §3](./design.md#3-colour-palette).

| Foreground | Background | Ratio | Verdict |
| --- | --- | --- | --- |
| `#111827` ink | `#FFFFFF` | 17.4 : 1 | ✅ AAA |
| `#111827` ink | `#F8FAFC` | 16.7 : 1 | ✅ AAA |
| `#475569` body | `#FFFFFF` | 7.5 : 1 | ✅ AAA |
| `#475569` body | `#F8FAFC` | 7.2 : 1 | ✅ AAA |
| `#111827` ink | `#D4AF37` gold | 8.9 : 1 | ✅ AAA — primary buttons |
| `#94A3B8` muted | `#111827` footer | 6.4 : 1 | ✅ AA |
| `#065F46` | `#D1FAE5` verified pill | 8.0 : 1 | ✅ AAA |
| `#FFFFFF` | `#111827` | 17.4 : 1 | ✅ AAA |
| **`#D4AF37` gold** | **`#FFFFFF`** | **2.4 : 1** | ❌ **fails** |
| **`#94A3B8` muted** | **`#FFFFFF`** | **2.6 : 1** | ❌ **fails** |

### Rules

1. **Gold text on white is decorative only.** Permitted for eyebrow labels (which duplicate the
   adjacent `<h2>`), the gold half of the hero headline (which duplicates nothing meaningful on its
   own but is a display element, not content the user must read to act), and the active nav item —
   which must **also** carry `aria-current="page"` so state is not conveyed by colour alone.
   Never use gold for body copy, form labels, error messages, prices or links.
2. **`muted` (`#94A3B8`) may only appear on the `#111827` footer.** Never on white.
3. **Never convey information by colour alone.** The active nav item gets `aria-current`; the
   wishlist state gets `aria-pressed`; validation errors get text, not just a red border.
4. Text over photography (CategoryCard, FeatureProductCard, PromoBanner) must sit on the `overlay`
   scrim. Spot-check the lightest region of each image at 4.5:1 before shipping.
5. Non-text UI (icon strokes, input borders, focus rings) needs 3:1 against its adjacent colour.
   `#E2E8F0` on white is 1.2:1 — acceptable for a *decorative* card hairline, but **input borders
   must darken to `#94A3B8` or better**, and focus must never rely on the hairline.

---

## 2. Semantics

### Landmarks — exactly one of each per page

```html
<header>   <!-- site header, contains <nav aria-label="Primary"> -->
<main id="main">
<footer>   <!-- contains <nav aria-label="Footer"> -->
<nav aria-label="Mobile">  <!-- bottom navigation -->
```

### Headings

- One `<h1>` per page. On the homepage that is the hero headline.
- Every section opens with an `<h2>` rendered by `SectionHeader`. No skipped levels.
- The eyebrow is **not** a heading — it is a `<p>` or `<span>` inside the header block.
  Marking it up as `<h3>` breaks the outline.
- Never choose a heading level for its size. Set the level for the outline, style with a class.

### Element choices

| Use | Not |
| --- | --- |
| `<button>` for actions | `<div onClick>` |
| `<a href>` / `next/link` for navigation | `<button onClick={router.push}>` |
| `<ul>/<li>` for card grids and nav lists | bare `<div>`s |
| `<figure>` + `<blockquote>` + `<figcaption>` for reviews | nested `<div>`s |
| `<form>` with a submit button for the newsletter | a `<div>` with a click handler |
| `<s>` + accessible label for a struck-through old price | CSS `line-through` alone |

---

## 3. Keyboard

**Must**

- Every interactive element reachable by `Tab` in DOM order, which must match visual order.
- Visible focus on **everything**: `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`.
  `outline: none` without a replacement is an automatic rejection.
- A "Skip to content" link, first in the DOM, visually hidden until focused, targeting `#main`.
- Mobile drawer: focus moves in on open, is trapped while open, `Escape` closes, focus returns to
  the trigger.
- Category scroller: reachable and scrollable by keyboard (`tabindex="0"` on the scroll region with
  an accessible name, or per-item focus that scrolls into view).
- No positive `tabindex`. Ever.
- No keyboard trap outside a deliberate modal.

**Must not**

- Reorder meaningful content with `order-*` (see [`responsive.md` §2](./responsive.md)).
- Remove elements from the tab order that a mouse user can activate.

---

## 4. Images

| Case | `alt` |
| --- | --- |
| Product photo | Describe it: `"Executive Messenger black leather satchel with brass buckles"` |
| Category tile | The destination: `"Shop Men's bags"` — the tile is a link, so `alt` names the target |
| Hero | Describe the scene |
| Instagram tile | Describe the scene; if the tile links out, name the destination |
| Decorative / scrim | `alt=""` — and never `alt="image"`, `alt="photo"`, or the filename |
| Logo | `alt="Knock Nation Bag"` on the linked instance; `alt=""` if adjacent text already says it |

Every `next/image` needs explicit dimensions (or `fill` in a fixed-ratio parent) so nothing shifts —
CLS is an accessibility issue for users with motion or cognitive disabilities, not just a metric.

---

## 5. Icons & Icon-Only Controls

```jsx
// Correct
<button aria-label="Search" className="…">
  <Search size={22} aria-hidden="true" />
</button>

// Correct — icon accompanies visible text
<button className="…">
  <ShoppingBag size={20} aria-hidden="true" />
  Add to cart
</button>
```

- Decorative icons: `aria-hidden="true"`. Always.
- Icon-only buttons: `aria-label` on the **button**, never on the SVG.
- The cart badge must not be announced as a bare number:
  `aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}`.
- The rating component wraps its stars in one labelled element so five stars are announced once:
  `<span role="img" aria-label="Rated 5.0 out of 5">`.

---

## 6. Forms

- Every input has a `<label>`. Use `sr-only` when the design hides it (newsletter) — never rely on
  `placeholder` as the label.
- `type="email"`, `autoComplete="email"`, `inputMode="email"` on the newsletter field.
- Errors: text beneath the field, linked with `aria-describedby`, field marked `aria-invalid="true"`.
- Submission status in an `aria-live="polite"` region.
- Never disable the submit button as the only error feedback — explain what is wrong.

---

## 7. Motion

- Wrap every animation in `prefers-reduced-motion`. The global override in `globals.css` is the
  safety net, not a substitute for thinking:

  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

- Scroll-reveal animations must render content **visible by default** and animate as an enhancement,
  so content is never gated on JS or on an IntersectionObserver that fails.
- No auto-playing carousels. No parallax. No content that moves for longer than 5 seconds without a
  pause control.

---

## 8. Touch & Target Size

- Minimum **44 × 44px** hit area (WCAG 2.2 SC 2.5.8 requires 24×24; 44 is the design standard here).
- Where the visual is smaller, expand with padding rather than growing the visual:
  the 34px wishlist button gets `p-[5px]` to reach 44px.
- Minimum 8px between adjacent targets.
- Bottom navigation items are 56px tall including their label.
- Nothing important within 16px of the viewport edge on mobile.

---

## 9. Screen Reader Support

- Test with NVDA (Windows) and VoiceOver (macOS/iOS) before each release.
- Product cards announce in a useful order: title → price → rating → actions. Achieve this with DOM
  order, not `aria-label` on the card.
- The card's link wraps the **title**, not the whole card, so the accessible name is the product
  name. If the whole card must be clickable, use a stretched pseudo-element from the title link
  (`after:absolute after:inset-0`) rather than nesting interactive elements.
- Never nest a `<button>` inside an `<a>`. `WishlistButton` and `QuickAddButton` must be siblings of
  the title link, positioned over the card.

---

## 10. Tooling & Verification

**Automated (catches ~30%)**
- `eslint-plugin-jsx-a11y` in the lint config, errors not warnings
- axe DevTools on every page before merge
- Lighthouse accessibility score ≥ 95

**Manual (catches the rest) — required per release**
- [ ] Tab through the entire page; focus is always visible and never lost
- [ ] Operate the mobile drawer and bottom nav with keyboard only
- [ ] Zoom to 200% — no clipping, no horizontal scroll
- [ ] Zoom text only to 200% — layout survives
- [ ] Disable CSS — content order still reads correctly
- [ ] Disable JS — all content is present and links work
- [ ] Screen-reader pass on the homepage
- [ ] Windows High Contrast Mode — borders and focus remain visible
- [ ] `prefers-reduced-motion: reduce` — nothing animates

---

## 11. Known Risks in This Design

| Risk | Mitigation |
| --- | --- |
| Gold accent fails contrast on white | Decorative use only, always paired with a compliant duplicate (§1) |
| Text over photography in 3 components | Mandatory `overlay` scrim; spot-check each image |
| 34px wishlist button is under 44px | Padding to a 44px hit area |
| Hairline `#E2E8F0` borders are very low contrast | Acceptable for decorative card edges; inputs and focus use darker values |
| Mobile category scroller can hide items off-screen | Snap points, keyboard scrolling, no content unique to the scroller |
| Bottom nav overlaps footer | `pb-24` on the footer at mobile widths |
