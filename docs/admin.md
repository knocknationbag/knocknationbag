# Admin Dashboard

> UI architecture and component inventory. No business logic, APIs, SQL, CRUD or auth —
> Phase 3 is the frontend foundation only.

---

## 1. Route structure

The storefront chrome used to live in the root layout, which meant any new surface inherited the
site header and footer. It now sits in a route group, so the dashboard can have its own shell:

```
app/
├── layout.jsx           <html>, fonts, sitewide JSON-LD. No chrome.
├── (site)/
│   ├── layout.jsx       Header + Footer + MobileNav  ← storefront
│   └── …                all 27 public routes
├── auth/confirm/        exchanges emailed auth links for a session
└── (admin)/
    └── admin/
        ├── layout.jsx   metadata + noindex only. No chrome.
        ├── page.jsx     /admin -> /admin/dashboard
        ├── (shell)/
        │   ├── layout.jsx   AdminShell. Requires a session
        │   └── …            22 module routes
        └── (auth)/
            └── …            login · forgot-password · reset-password · unauthorized
```

The frame sits in `(shell)` rather than on `admin/layout.jsx` so the auth screens can share the
`/admin` prefix without inheriting a sidebar. Route groups do not affect URLs — every module path is
unchanged.

Route groups do not affect URLs — every public path is unchanged, verified by build output.
`/admin/*` is `noindex, nofollow, nocache` via the admin layout's metadata.

---

## 2. Design language

The dashboard uses the **same** palette, fonts, radii and border colour as the storefront. Only the
scale differs: the storefront scale is marketing-sized (73px display), while a dashboard needs SaaS
density — roughly the storefront at 75% zoom.

That is achieved with an admin type scale in the `@theme` block of `app/globals.css`, **not** by
changing zoom or introducing a second design system:

| Token | Size / line-height | Used for |
| --- | --- | --- |
| `text-admin-xs` | 11 / 16 | Table headers, meta, counters |
| `text-admin-sm` | 12 / 18 | Secondary text, hints |
| `text-admin` | 13 / 20 | Body, table cells, inputs |
| `text-admin-md` | 14 / 21 | Emphasis |
| `text-admin-lg` | 15 / 22 | Card titles |
| `text-admin-title` | 17 / 24 | Section titles |
| `text-admin-h1` | 20 / 28 | Page titles |
| `text-admin-stat` | 24 / 30 | KPI values |

Rules:
- **Never use storefront `text-*` tokens inside `app/(admin)`** and vice versa.
- Radii reuse existing tokens: `rounded-badge` (6px) for controls, `rounded-media` (12px) for cards.
- The sidebar uses the `ink` surface — the same dark panel as the site footer.
- Any new `--text-admin-*` token must also be registered in `FONT_SIZES` in `utils/cn.js`
  (see docs/CLAUDE.md §6 for why).

Density targets: 8px control padding, 32–36px control heights, 10px table cell padding, 12–16px card gaps.

---

## 3. Component inventory

### Layout — `components/admin/layout/`
| Component | Notes |
| --- | --- |
| `AdminShell` | Frame. Owns the only two pieces of chrome state (drawer open, sidebar collapsed) so pages stay Server Components |
| `AdminSidebar` | Sticky on desktop, collapsible to a 60px rail, off-canvas drawer below xl. Filters items by role |
| `AdminTopbar` | Sticky, 56px. Breadcrumbs, global search, notifications, acting role |
| `AdminPageHeader` | Title, description, actions, optional tabs |

### UI kit — `components/admin/ui/`
| Component | Notes |
| --- | --- |
| `AdminCard` | Every panel. `min-w-0` + `overflow-hidden` — see §6 |
| `AdminButton` | Compact button, 4 variants × 3 sizes. Storefront `Button` is a 52px marketing pill and is not used here |
| `AdminField` / `AdminToggle` | Labelled input/textarea/select with optional live character counter; switch |
| `DataTable` | The only table. Resolves declarative column specs — see §5 |
| `StatCard` | KPI tile with delta |
| `StatusBadge` | Status pill. `STATUS_TONE` maps a status word to a tone so "Published" is never two colours |
| `Toolbar` | Search + inline filters + actions row |
| `AdminPagination` | Row-window pager |
| `AdminEmptyState`, `AdminTableSkeleton` | Empty and loading states |
| `Overlay` | `Modal`, `SideDrawer`, `ConfirmDialog` over one shared focus-trap/Escape/scroll-lock hook |

### Modules — `components/admin/modules/`
| Component | Notes |
| --- | --- |
| `ListModule` | Generic searchable/filterable/paginated list. **13 of the 22 modules are a column spec, not a screen** |
| `columns.jsx` | Declarative column spec builders (pure data) |
| `ProductListTable` | Product list with bulk select and delete confirmation |
| `ProductForm` | Create/edit across 7 tabs incl. gallery, variants and SEO |
| `MediaLibrary` | Folders, search, unused/missing-alt filters, detail drawer |

### Product module — `components/admin/product/`
| Component | Notes |
| --- | --- |
| `ProductForm` | Orchestrator only — owns state and tab routing. Sections live in `sections/` |
| `sections/BasicSections` | Basic info, description, pricing, inventory |
| `sections/OrganisationSections` | Categories/brands/collections/tags, specs, attributes, shipping, related |
| `sections/VariantsStatusSections` | Variants table, status, visibility |
| `ProductListTable` | Search, filters, sorting, pagination, bulk selection. `statusFilter` backs all three list routes |
| `ProductBulkBar` | Fixed bulk action bar — publish, draft, archive, category, brand, tags, delete |
| `ProductStatusTabs` | All / Drafts / Archived as real links, so each view has a URL |
| `MediaGallery` | Upload UI, grid/list views, drag-and-drop reorder, primary image, per-image SEO |
| `ProductPicker` | Searchable multi-select backing Related, Cross-sell and Upsell |
| `ProductPreview` | Storefront approximation at three widths + search/social previews |

Form state lives in `lib/admin/productForm.js` (`buildProductFormState`, `buildProductSeoState`), so
create, edit and duplicate start from one definition and cannot drift apart. A duplicate deliberately
starts as **Draft + noindex** so it never competes with its original in search.

`RESERVED_PRODUCT_SLUGS` exists because static child routes (`new`, `drafts`, `archived`) shadow the
`[slug]` segment — a product with one of those slugs would be unreachable for editing, so they are
excluded from `generateStaticParams` and should be rejected on slug entry later.

### Media Library — `components/admin/media/`

The single image manager for the whole application. Every module selects images
through it rather than typing paths, so alt text always travels with the image and
usage is tracked in one place.

| Component | Notes |
| --- | --- |
| `MediaBrowser` | The library itself — folders, views, search, type/sort filters, grid+list, details drawer. **Reusable, not page-bound** |
| `MediaDashboard` | `/admin/media` — stat tiles + browser, owns library state so edits update the stats live |
| `MediaViews` | `MediaGrid` and `MediaList`, sharing one flag renderer so both agree |
| `MediaDetails` | Preview, rename, replace, alt/title/caption/description, technical metadata, copy URL/path, download, delete |
| `MediaPicker` | Modal wrapper around `MediaBrowser` in `select` mode. Single or multiple |
| `MediaPickerField` | Single-image form field — replaces free-text path inputs |
| `CopyField` | Read-only value + copy button with an `aria-live` confirmation |

`MediaBrowser` runs in two modes — `manage` (the page) and `select` (inside the picker).
One implementation, so the picker can never drift from the library it picks from.

**Already wired:** product gallery (`multiple`), SEO Open Graph image and Twitter image
(`MediaPickerField`). Categories, brands, collections, CMS, homepage and blog adopt it by
importing `MediaPicker` — no new UI required.

`onSelect` returns full media records, not paths, so callers inherit alt text.

Data lives in `data/media.js`, helpers in `lib/admin/media.js` (`filterMedia`, `sortMedia`,
`mediaStats`, `formatBytes`, `renameFile`). Records are **deduped by path** with `usedIn` merged —
several products share a photograph, and showing one file as several rows would make the delete
dialog under-report what it breaks.

### SEO — `components/admin/seo/`
| Component | Notes |
| --- | --- |
| `SeoPanel` | The complete SEO editor. Used by product, category, collection, CMS page and blog |
| `GooglePreview`, `SocialPreview`, `SeoValidation` | Live previews and the readiness checklist |

---

## 4. SEO is first-class

`lib/admin/seo.js` defines **one** SEO field set. Every content type stores that shape, so a new
content type inherits the full editor, counters, previews and validation with no extra UI work.

Fields: SEO title · meta description · slug · focus keyword · breadcrumb title · OG title/description/image ·
Twitter title/description/image · canonical · robots directive · index toggle · follow toggle ·
schema type · structured data (JSON, validated) · redirect from + type · alt text · image title ·
caption · description.

Also provided:
- **Character counters** against ideal/max limits (amber past ideal, red past max).
- **Live Google SERP preview** with real truncation.
- **Live Open Graph and Twitter card previews.**
- **`validateSeo()`** — 11 rules returning `error` / `warning` / `pass`, plus `seoScore()` 0–100.
  Pure functions, so the same rules can run server-side later without touching the UI.

`/admin/seo` aggregates scores by module and lists the lowest-scoring records.

---

## 5. Adding a module

Most modules are a table of records, so they need a column spec rather than a screen:

```jsx
// app/(admin)/admin/<module>/page.jsx  — Server Component
export const metadata = { title: 'Widgets' }

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Widgets" description="…" />
      <ListModule
        rows={widgets}
        searchKeys={['title', 'slug']}
        filters={[{ name: 'status', label: 'Status', options: ['Published', 'Draft'] }]}
        columns={[
          col.titleCell({ header: 'Widget' }),
          col.seoScore(),
          col.status(),
          col.rowActions({ label: 'widget', editHrefBase: '/admin/widgets' }),
        ]}
      />
    </>
  )
}
```

Then add one entry to `constants/adminNav.js` and its required permission to `MODULE_PERMISSION`.

**Column specs must stay plain data.** Pages are Server Components (so they can export `metadata`)
but `ListModule` is a Client Component, and functions cannot cross that boundary. That is why a spec
carries `type: 'status'` rather than a `render` callback — `DataTable` resolves the type to a renderer
on the client. Use `render` directly only when page and table are on the same side (e.g. the
dashboard, which is server-only).

The same rule bit us with `data/catalog.js`: its `collections` entries carry a `match` predicate, so
Client Components consume `collectionOptions` instead.

---

## 6. Layout gotchas worth remembering

- **`min-w-0` on any card that can contain a table.** As a grid/flex child the default
  `min-width: auto` lets a wide table's min-width expand the track instead of scrolling inside it,
  which pushes the whole page sideways. Same root cause as the hero-banner bug.
- **`overflow-hidden` on `AdminCard`** hard-clips wide tables to the card and makes content respect
  its rounded corners. Admin filters use native `<select>`, which renders outside the clip.
- **A `min-width` table inside a scroller can still make the page scrollable** in Chromium even when
  an ancestor clips it. Prefer `w-max min-w-full` over `w-full min-w-[Npx]`.
- **Very wide grids need a different mobile shape, not a scrollbar.** The 9-role × 17-permission
  matrix on `/admin/roles` becomes a per-role list below `md`: same information, readable shape.
- Verify with actual scrollability (`window.scrollTo(9999, 0)` then read `scrollX`), not
  `documentElement.scrollWidth` — the latter gives false positives with nested scrollers.

---

## 7. Roles and permissions

`constants/adminRoles.js` defines 9 roles and 17 permissions, plus `MODULE_PERMISSION` mapping each
module to the permission required to see it. `AdminSidebar` hides modules the acting role cannot access.

The role now comes from the **session**, not a hard-coded value — see §9.

**Ask permission questions through `lib/auth/permissions.js`, never by comparing role ids.**
A `roleId === 'super-admin'` anywhere outside that module is how a permission system rots.

| Helper | Use |
| --- | --- |
| `can(user, PERMISSIONS.X)` | The single permission predicate |
| `canAny` / `canAll` | Multiple permissions |
| `hasDashboardAccess(user)` | The gate for `/admin` as a whole |
| `canAccessPath(user, path)` | Longest-prefix module rule; **closed by default** |
| `requiredPermissionFor(path)` | Which permission a path needs |
| `requirePermission(p)` | Server-side assert — redirects. Use in Server Actions |

Sidebar filtering is presentation only and still not a security boundary.

---

## 8. Responsive behaviour

| Breakpoint | Sidebar | Notes |
| --- | --- | --- |
| ≥ 1280 (`xl`) | Sticky, 240px, collapsible to 60px | Full tables |
| 768–1279 | Off-canvas drawer | Tables scroll inside their card; inline filters collapse to a Filters drawer |
| < 768 | Off-canvas drawer | Wide matrices switch to list form |

Verified at 1920 / 1440 / 1280 / 1024 / 768 / 390: no horizontal page scroll, one `<h1>` per page,
no missing `alt`, no unlabelled icon buttons.

---

## 9. Authentication

Email + password via Supabase Auth. Sessions live in httpOnly cookies managed by `@supabase/ssr`;
nothing is stored in `localStorage` and no token is ever handled in client code.

### Where things live

| File | Role |
| --- | --- |
| `lib/auth/routes.js` | Path constants and the rules the proxy applies. Edge-safe, pure |
| `lib/auth/user.js` | Supabase user → dashboard user. Reads the role claim |
| `lib/auth/permissions.js` | Every permission question (§7) |
| `lib/auth/session.js` | `getSessionUser`, `requireDashboardUser`, `requirePermission`. `server-only` |
| `lib/auth/actions.js` | Server Actions: sign in, sign out, request reset, update password |
| `lib/auth/authErrors.js` | Validation and safe error messages |
| `app/auth/confirm/route.js` | Exchanges an emailed `token_hash` for a session |
| `components/admin/auth/` | `AuthShell`, `AuthMessage`, `PasswordField`, three forms |

### Three things worth not re-deciding

**The role comes from `app_metadata`, never `user_metadata`.** `user_metadata` is writable by the
user through `supabase.auth.updateUser()`, so a role stored there would let any account promote
itself to Super Admin. `app_metadata` needs the service-role key to write.

**An unknown or absent role grants nothing.** `toAdminUser` yields `roleId: null` rather than a
default, and those users land on `/admin/unauthorized`. New staff are locked out until a role is
assigned — deliberately, since the alternative is granting access by accident.

**Checks happen twice, and that is not redundancy.** The proxy redirects early for speed; the
`(shell)` layout re-verifies with `getUser()` and is the actual boundary. Server Actions must call
`requirePermission()` themselves — neither of the other two covers them.

### Flows

- **Sign in** → `/admin/dashboard`, or the sanitised `?next=` path. `safeNextPath()` rejects
  absolute, protocol-relative and non-admin targets, so `?next=` cannot become an open redirect.
- **Password reset** → email link → `/auth/confirm` (`verifyOtp`) → `/admin/reset-password`.
  Saving revokes every other session. `/admin/reset-password` is deliberately reachable while
  signed in: following the recovery link *is* what signs you in.
- **No account enumeration.** Bad credentials always read "Invalid email or password", and the
  reset confirmation is identical whether or not the address exists.

Reading the session makes `/admin/*` dynamic. That is correct — nothing gated on identity may be
statically cached (`CLAUDE.md` §19).

### Assigning a role

Supabase → Authentication → Users → the user → **User Metadata (app)**:

```json
{ "role": "super-admin" }
```

Valid ids: `super-admin` · `admin` · `manager` · `seo-manager` · `content-editor` ·
`inventory-manager` · `order-manager` · `support` · `customer`.

---

## 10. Scope: two live modules

The sidebar is narrowed to **Dashboard, Users and Products**. Everything else is hidden, not
deleted — `ENABLED_MODULES` in `constants/adminNav.js` controls what renders, and a module
returns by adding its href back. Hidden routes still resolve by URL and still read static
data; `adminNavFlat` keeps every entry so their breadcrumbs stay correct.

### Database-backed vs static

Users and Products read Supabase. Every other module still reads `data/*.js`. The two
overlap in one place worth remembering: **the storefront still renders from
`data/products.js`**, so a product created in the dashboard does not yet appear on the site.
Wiring the storefront to the database is a separate step.

| Layer | Files |
| --- | --- |
| Schema | `supabase/migrations/*.sql` — **written, not applied**. See `supabase/README.md` |
| Queries + mappers | `lib/db/{products,profiles,errors}.js`, all `server-only` |
| Mutations | `lib/actions/{products,users}.js`, Server Actions that re-check the session |
| List UI | `components/admin/modules/ServerListModule.jsx` |
| Forms | `components/admin/users/UserForm.jsx`, `components/admin/product/ProductEditor.jsx` |

`ListModule` still serves the static modules; `ServerListModule` handles URL-backed state and
server-side paging, which is a different problem, not the same one twice.

### Things that will bite if forgotten

- **Status vocabularies live in `constants/recordStatus.js`**, not in `lib/db/*`. Those modules
  are `server-only`, so importing a constant from one into a form drags the Supabase client
  into the browser bundle and fails the build. They are mirrored by check constraints.
- **A profile cannot exist without an auth user** — `profiles.id` *is* `auth.users.id`. That is
  why "Add user" creates a sign-in account and shows a temporary password once.
- **Modules degrade rather than crash** when the tables are absent: `isMissingTable()` turns
  a `42P01` into a setup panel.
- **`seo_score` is computed server-side** in the save action, never accepted from the client.
- **The generated canonical comes from `autoCanonical()`** — validation, the Google preview and
  the editor all call it, so the URL the panel predicts is the URL that gets used.
