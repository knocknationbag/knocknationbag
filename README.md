# Knock Nation Bag

Production ecommerce frontend for a premium bag brand.

**Next.js 16 (App Router, Turbopack) · React 19 · JavaScript only · Tailwind CSS v4**

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (Turbopack) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Documentation

All project rules live in [`docs/`](./docs) and are binding.

Start with **[`docs/CLAUDE.md`](./docs/CLAUDE.md)** (how to work in this codebase) and
**[`docs/design.md`](./docs/design.md)** (the design system — the single source of truth for
every visual decision).

| Doc | Covers |
| --- | --- |
| [design.md](./docs/design.md) | Colour, type, spacing, grid, components, animation, measured geometry |
| [architecture.md](./docs/architecture.md) | Folder structure, server vs client, data flow |
| [components.md](./docs/components.md) | Component inventory and prop contracts |
| [assets.md](./docs/assets.md) | Asset manifest, naming, icon strategy |
| [responsive.md](./docs/responsive.md) | Breakpoints and per-section behaviour |
| [accessibility.md](./docs/accessibility.md) | WCAG 2.2 AA requirements |
| [seo.md](./docs/seo.md) | Metadata, structured data, Core Web Vitals |
| [roadmap.md](./docs/roadmap.md) | Phased expansion to a full platform |

## Notes

- **No `tailwind.config.js`.** Tailwind v4 is CSS-first; design tokens live in the `@theme` block
  of [`app/globals.css`](./app/globals.css).
- **`AGENTS.md` is maintained by Next.js.** It is imported by `CLAUDE.md`; do not hand-edit it.
- **`reference/`** holds the original design mockups and unprocessed source art. It is not deployed
  and is safe to delete once [`docs/assets.md` §6](./docs/assets.md) has been reviewed.

## Status

- **Phase 0** ✅ Documentation, design system, folder structure, assets, project initialisation
- **Phase 1** ⏳ Home landing page — not started
