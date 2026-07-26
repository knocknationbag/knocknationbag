# Assets

> **The project is independent of `reference/`.** Every asset the site needs has already been copied
> into `public/`. `reference/` can be deleted at any time — but read §6 first, it lists what would
> be lost.

---

## 1. Structure

```
public/
├── images/
│   ├── hero/          2 files   hero photography
│   ├── categories/    8 files   one per category
│   ├── products/     13 files   one per product
│   ├── banners/       2 files   full-bleed promo imagery
│   └── lifestyle/     6 files   Instagram strip
├── icons/
│   └── payment/       1 file    payment-method chip strip (fallback)
└── logo/              4 files   monogram variants + favicon
```

Total: **32 files, 0.50 MB** (down from 13 MB of source PNGs).

---

## 2. Naming Convention

| Rule | Example |
| --- | --- |
| `kebab-case` only | `apex-duffle-pro.webp` |
| Named for **what it is**, never for where it sits | `men.webp`, not `cat-image.png` |
| Product images use the product `slug` verbatim | `products/executive-messenger.webp` matches `slug: 'executive-messenger'` |
| Ordered sets carry a zero-padded index | `ig-01-airport.webp` |
| Logo variants suffix the colourway | `kn-monogram-white.svg` |
| No spaces, no capitals, no `Rectangle12`, no version numbers | — |

**A new asset that does not follow this convention does not get merged.**

---

## 3. Formats

| Type | Format | Why |
| --- | --- | --- |
| Photography | **WebP**, quality 86–90 | ~26× smaller than the source PNGs at visually identical quality. `next/image` re-encodes to AVIF/WebP per request regardless; the source format only affects repository weight and build time. |
| Logo, icons | **SVG** | Resolution-independent, styleable, ~1 KB |
| Favicon | **SVG** | With a PNG fallback generated at build if needed |

Never commit a JPEG or a photographic PNG. Never commit an asset above **300 KB**.

---

## 4. Asset Manifest

Every file, its source in `reference/assets/`, its native size, and where it is used.

### 4.1 `public/logo/` — hand-authored

Derived from `reference/assets/kn-monogram-vector*.svg`, cleaned up: Figma IDs removed, fixed
`width`/`height` dropped so the mark scales from its `viewBox`, `role="img"` + `aria-label` added.

| File | Colourway | Used by |
| --- | --- | --- |
| `kn-monogram.svg` | `#111827` body · `#D4AF37` handle · white bars | Header, MobileDrawer, light surfaces |
| `kn-monogram-white.svg` | White body · gold handle · `#111827` bars | Footer, any dark surface |
| `kn-monogram-mono.svg` | Single-colour `#111827` | Print, single-colour contexts |
| `favicon.svg` | Same as default | Browser tab, PWA icon |

The **wordmark is live text**, not an image: `KNOCK NATION` in Outfit 800 with `BAG` beneath in
mono, letter-spaced gold. This keeps it crisp at any size and searchable. See design.md §11.

### 4.2 `public/images/hero/`

| File | Source | Native | Used by |
| --- | --- | --- | --- |
| `hero-desktop.webp` | `hero-photo.png` | 680 × 520 | HeroSection ≥1280 |
| `hero-tablet.webp` | `hero-photo1.png` | 420 × 340 | HeroSection 768–1279 |

Mobile reuses `hero-desktop.webp` full-bleed with `object-cover` — the mobile mockup's own hero
photo was never exported to `reference/assets/`.

### 4.3 `public/images/categories/`

All eight sourced from the 1760 × 680 exports, downscaled to **1100 × 425**. The card crops to
11:8 via `object-cover`, so the full frame is retained and `object-position` stays tunable in code.

| File | Source | Subject |
| --- | --- | --- |
| `men.webp` | `cat-image.png` | Man in a suit with a briefcase, city street |
| `women.webp` | `cat-image2.png` | Woman carrying a tote, city street |
| `travel.webp` | `cat-image3.png` | Luggage in an airport terminal |
| `laptop.webp` | `cat-image4.png` | Laptop sleeve and tech accessories, flat lay |
| `office.webp` | `cat-image5.png` | Tan briefcase on a desk |
| `backpack.webp` | `cat-image6.png` | Black technical backpack |
| `school.webp` | `cat-image7.png` | Backpacks among books, library |
| `accessories.webp` | `cat-image8.png` | Wallets, card holders and keychains on marble |

Order is canonical and matches `data/categories.js` and the tablet mockup's 4 × 2 grid.

### 4.4 `public/images/products/`

Native size preserved — these are already the exact rendered dimensions.

| File | Source | Native | Product | Price | Section |
| --- | --- | --- | --- | --- | --- |
| `apex-duffle-pro.webp` | `product-photo9.png` | 390 × 280 | Apex Duffle Pro | $249 | Featured |
| `monarch-leather-tote.webp` | `product-photo.png` | 390 × 280 | Monarch Leather Tote | $299 | Featured |
| `quantum-pack-15.webp` | `product-photo2.png` | 390 × 280 | Quantum Pack 15-inch | $189 | Featured |
| `atlas-shell-roller.webp` | `product-photo3.png` | 390 × 280 | Atlas Shell Roller | $349 | Featured |
| `executive-messenger.webp` | `product-photo4.png` | 390 × 280 | Executive Messenger | $219 | Best Sellers |
| `meridian-travel-pack.webp` | `product-photo6.png` | 390 × 280 | Meridian Travel Pack | $279 | Best Sellers |
| `equinox-commuter.webp` | `product-photo7.png` | 390 × 280 | Equinox Commuter | $169 | Best Sellers |
| `nova-crossbody.webp` | `product-photo8.png` | 390 × 280 | Nova Crossbody | $129 | Best Sellers |
| `nomad-tech-folio.webp` | `product-photo11.png` | 539 × 280 | Nomad Tech Folio | $99 | New Arrivals |
| `helios-roll-top.webp` | `product-photo10.png` | 539 × 280 | Helios Roll-Top | $199 | New Arrivals |
| `aria-bucket-bag.webp` | `product-photo12.png` | 539 × 280 | Aria Bucket Bag | $179 | New Arrivals |
| `aero-shell-suitcase.webp` | `Rectangle9.png` | 868 × 360 | Aero Shell Suitcase | $389 | New Arrivals (wide) |
| `signature-leather-sling.webp` | `Rectangle10.png` | 868 × 360 | Signature Leather Sling | $149 | New Arrivals (wide) |

> **Known limitation.** The 390 × 280 sources are 1× assets. A desktop product card renders its
> image at 390 CSS px, so on a 2× display these are upscaled and will look slightly soft. There is
> no higher-resolution source in `reference/`. If sharper art becomes available, replace the file
> in place — the filename and every import stay the same.

### 4.5 `public/images/banners/`

| File | Source | Native | Used by |
| --- | --- | --- | --- |
| `promo-crafted.webp` | `banner-bg.png` | 1920 × 480 | PromoBanner, **all breakpoints** |
| `promo-crafted-alt.webp` | `banner-bg2.png` | 1024 × 360 | Unused. Kept as an alternate campaign image |

The tablet mockup used a different photo here; content parity means one image everywhere
(design.md §14, deviation 9).

### 4.6 `public/images/lifestyle/`

Instagram strip, in render order.

| File | Source | Native | Subject |
| --- | --- | --- | --- |
| `ig-01-airport.webp` | `Rectangle.png` | 300 × 220 | Traveller in an airport terminal |
| `ig-02-tote-flatlay.webp` | `Rectangle2.png` | 300 × 220 | Tan tote, notebook and coffee, flat lay |
| `ig-03-hotel-lobby.webp` | `Rectangle3.png` | 300 × 220 | Guest with luggage in a hotel lobby |
| `ig-04-gallery-chair.webp` | `Rectangle4.png` | 300 × 220 | Satchel on a chair in a gallery |
| `ig-05-backpack-stairs.webp` | `Rectangle5.png` | 300 × 220 | Backpack on concrete steps |
| `ig-06-business-duo.webp` | `Rectangle6.png` | 300 × 220 | Two professionals with briefcases |

### 4.7 `public/icons/payment/`

| File | Source | Notes |
| --- | --- | --- |
| `payment-methods.svg` | `payment-methods.svg` | 188 × 26, four 38 × 26 chips. Fallback only — prefer composing chips from `lucide-react` + `Badge` so colours stay tokenised |

---

## 5. Icons

**Icons are code, not files.** Every icon in the reference is a Figma export of a standard
[Lucide](https://lucide.dev) glyph, so we import them from `lucide-react` instead of shipping SVGs.

```jsx
import { Search, Heart, User, ShoppingBag } from 'lucide-react'

<Search size={22} strokeWidth={2} className="text-ink" aria-hidden="true" />
```

| Reference export | Lucide name | Used by |
| --- | --- | --- |
| `search-icon.svg`, `search.svg` | `Search` | Header |
| `account.svg`, `user.svg` | `User` | Header, MobileNav |
| `shopping-bag.svg`, `Frame1.svg` | `ShoppingBag` | Header, MobileNav |
| `heart.svg` | `Heart` | Header, WishlistButton, MobileNav |
| `whishlist.svg`, `wishlist-btn.svg` | `HeartOff` | **Not used** — see design.md §14, deviation 7 |
| `star.svg`, `white-star.svg`, `icon-wrap2.svg` | `Star` | Rating |
| `icon-wrap1.svg` | `ArrowRight` | CategoryCard |
| `icon-frame.svg`, `icon-frame1.svg` | `ShieldCheck` | FeatureCard — Premium Quality |
| `icon-frame2.svg`, `icon-frame23.svg` | `Truck` | FeatureCard — Fast Delivery |
| `icon-frame3.svg` | `RefreshCw` | FeatureCard — Easy Returns |
| `icon-frame4.svg`, `icon-frame27.svg` | `Lock` | FeatureCard — Secure Payments |
| `icon-frame5.svg`, `icon-frame29.svg` | `BadgeCheck` | FeatureCard — Warranty |
| `socials.svg` | `Instagram`, `Facebook`, `Twitter`, `Youtube` | Footer |
| `payment-methods.svg` | `CreditCard` + `Badge` | Footer |

`icon-frame*.svg` also encode the 48px gold circle behind each feature icon
(`fill="#D4AF37" fill-opacity="0.10"`). That is reproduced by the `IconTile` component, not by an SVG.

**Rules**
1. Never add an icon as a file when Lucide has it.
2. Always set `aria-hidden="true"` on decorative icons; the accessible name lives on the parent control.
3. Always set `strokeWidth={2}` — the reference exports all use a 2px stroke.
4. Size via the `size` prop, colour via a Tailwind class. Never hard-code `stroke="#111827"`.

---

## 6. What Was Left Behind

These `reference/assets/` files were **not** copied — they are lower-resolution breakpoint variants
or alternates the design does not use. `next/image` derives every responsive size from the sources
in §4, so none of them are needed.

**Read this list before deleting `reference/`.** If any of these images are wanted later, copy them
out first.

| Files | Size | What they are |
| --- | --- | --- |
| `product-photo13, 21, 22, 25, 27, 28, 30, 31, 32` | 275 × 220 | Tablet-resolution product shots. Some are *different photographs* of the same products, not just smaller crops |
| `cat-image1, 14, 15, 16, 17, 18, 20`, `cat-imag19` | 220 × 160 | Tablet-resolution category tiles — different photographs from the 1760 × 680 set |
| `Rectangle11`, `Rectangle12` | 456 × 220 | Tablet New Arrivals wide cards |
| `Rectangle13`, `Rectangle16`, `Rectangle41`, `Rectangle42` | 223 × 180 | Tablet Instagram tiles — **four unique photographs** (gold zippers, man on a street, passport flat lay, city skyline) not present in the desktop set |
| `Rectangle43`, `Rectangle45` | 458 × 180 | Unused banner crops (desk with tote; lobby with backpack) |
| `product-phot23`, `product-photo45` | 432 × 220 | Two unused products (black hardshell case, cream flap bag) |
| `Frame156.svg` | 69 × 12 | Wordmark fragment, superseded by live text |
| `payment-socials-group.svg`, `socials.svg` | — | Superseded by `lucide-react` |
| `kn-monogram-vector1/3/46.svg` | — | Colourway and size variants, regenerated into `public/logo/` |
| `reference/logo/kn-logo.png` | 142 × 48 | Raster logo lockup, superseded by SVG + live text |

The four unique tablet Instagram photographs are the only genuinely irreplaceable content here —
consider copying them into `public/images/lifestyle/` if the strip is ever extended past six tiles.

---

## 7. Adding a New Asset

1. Confirm it is actually needed — check `next/image` cannot derive it from an existing source.
2. Resize to no more than **2× the largest rendered CSS size**.
3. Convert to WebP, quality 86 (90 for product cut-outs).
4. Name it per §2 and drop it in the correct `public/images/*` subfolder.
5. Add a row to the manifest in §4.
6. Reference it by its absolute public path — never import an image through the bundler:

   ```jsx
   <Image src="/images/products/apex-duffle-pro.webp" alt="…" width={390} height={280} />
   ```

7. Never reference anything under `reference/`. That folder is not deployed and may be deleted.

---

## 8. Regenerating

The copy step is reproducible. If `reference/assets/` is still present, `public/images/` can be
rebuilt from scratch with a script following the mapping in §4 (resize → WebP → rename). Once
`reference/` is gone, `public/` is the only source of truth — back it up with the repository.
