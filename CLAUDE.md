@AGENTS.md

# Knock Nation Bag

Production ecommerce frontend. **Next.js 16 (App Router) · JavaScript only · React 19 · Tailwind CSS v4.**

> **Next.js 16 has breaking changes from earlier versions.** Authoritative docs are bundled at
> `node_modules/next/dist/docs/`. Read the relevant guide there before using a Next.js API —
> do not rely on recalled Next 13/14/15 conventions.
>
> **Tailwind v4 is CSS-first: there is no `tailwind.config.js`.** All design tokens live in the
> `@theme` block in [`app/globals.css`](./app/globals.css).

## Read first

**[`docs/CLAUDE.md`](./docs/CLAUDE.md)** — the full working rules.
**[`docs/design.md`](./docs/design.md)** — the design system, and the single source of truth for every visual decision.

| Doc | Covers |
| --- | --- |
| [docs/CLAUDE.md](./docs/CLAUDE.md) | Coding rules, naming, Tailwind, state, and every "how to add X" |
| [docs/design.md](./docs/design.md) | Colour, type, spacing, grid, components, animation, measured geometry |
| [docs/architecture.md](./docs/architecture.md) | Folder structure, server vs client, data flow |
| [docs/components.md](./docs/components.md) | Component inventory and prop contracts |
| [docs/assets.md](./docs/assets.md) | Asset manifest, naming, icon strategy |
| [docs/responsive.md](./docs/responsive.md) | Breakpoints and per-section behaviour |
| [docs/accessibility.md](./docs/accessibility.md) | WCAG 2.2 AA requirements |
| [docs/seo.md](./docs/seo.md) | Metadata, structured data, Core Web Vitals |
| [docs/roadmap.md](./docs/roadmap.md) | Phased expansion to a full platform |

## Non-negotiables

1. **No TypeScript.** No Bootstrap, Material UI, styled-components, Sass, CSS Modules, or any `.css` file other than `app/globals.css`.
2. **Never duplicate a component.** Same card twice = one component with props.
3. **Content is identical at every breakpoint.** Only layout changes — never hide, drop or rename content responsively.
4. **No hard-coded design values.** No raw hex, no `text-[19px]`, no magic spacing. Tokens only.
5. **Server Components by default.** `"use client"` only for state, events, browser APIs or context — at the smallest leaf.
6. **Recreate the design exactly.** Pixel-perfect. Improve the code, never the design.
7. **Never reference `reference/`.** All required assets are already in `public/`; that folder is not deployed and may be deleted.

## Known mockup conflicts

The desktop, tablet and mobile mockups contradict each other in ten places (dropped products,
renamed sections, a broken category grid, clipped cards). Every conflict is already resolved in
[`docs/design.md` §14](./docs/design.md#14-reconciled-deviations-from-the-mockups).
**Do not "fix" the code back toward a mockup.**

## Status

Phase 0 complete — documentation, folder structure, design system and assets.
Phase 1 (home landing page implementation) not started.
