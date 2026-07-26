# Supabase

> Integration layer only. No tables, no SQL, no auth flows, no CRUD — this document
> describes the plumbing that later phases build on.

---

## 1. Packages

| Package | Why |
| --- | --- |
| `@supabase/supabase-js` | Core client |
| `@supabase/ssr` | Cookie-aware clients for the App Router (browser + server) |
| `server-only` | Build-time guard so the service-role key can never reach a client bundle |

`@supabase/auth-helpers-nextjs` is **deprecated** and deliberately not installed — `@supabase/ssr`
replaces it.

---

## 2. Where the utilities live

```
lib/supabase/
├── env.js          Reads and validates the env vars. The only file that touches process.env.
├── client.js       Client Components      -> createClient()
├── server.js       Server Components / Actions / Route Handlers -> await createClient()
├── admin.js        Service role, bypasses RLS -> createAdminClient()   [server-only]
└── middleware.js   Session refresh helper -> updateSession(request)

proxy.js            Project root. Next.js 16 entry point, calls updateSession().
.env.local.example  Committed placeholder template.
```

Never call `createBrowserClient` / `createServerClient` directly in a component — always go through
these factories, so there is one place to change configuration (docs/CLAUDE.md §7, rule 4).

---

## 3. Which client do I use?

| Context | Import | Notes |
| --- | --- | --- |
| Client Component | `@/lib/supabase/client` | `createClient()` — sync. Anon key, RLS applies |
| Server Component | `@/lib/supabase/server` | `await createClient()` — async, reads cookies |
| Server Action / Route Handler | `@/lib/supabase/server` | Same. Re-check authorisation yourself |
| Webhook / admin task / cron | `@/lib/supabase/admin` | `createAdminClient()` — **bypasses RLS** |

```jsx
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select()
  return <pre>{JSON.stringify(data)}</pre>
}
```

```jsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function Widget() {
  const supabase = createClient()
  // ...
}
```

### Rules

1. **Create a client per request.** Never hoist one to module scope on the server — a shared
   instance would leak one visitor's session into another's.
2. **`await createClient()`** on the server. `cookies()` returns a promise in Next 15+.
3. **Never import `admin.js` from a Client Component.** The `server-only` import makes this a build
   failure rather than a silent leak — verified.
4. **Do not reach for `admin.js` to work around RLS.** If a query is blocked, fix the policy.
5. Follow the existing data contract (docs/architecture.md §4.1): map Supabase rows into the app's
   shape in `lib/api/`, so components never see a vendor-shaped object.

---

## 4. Environment variables

Copy the template and paste your values:

```bash
cp .env.local.example .env.local
```

| Variable | Exposure | Source in the Supabase dashboard |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Project Settings → API → `anon` / `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Project Settings → API → `service_role` |

- The two `NEXT_PUBLIC_*` values are meant to be public. **Row Level Security** is what protects
  your data, not the secrecy of the anon key.
- `SUPABASE_SERVICE_ROLE_KEY` must **never** carry a `NEXT_PUBLIC_` prefix. With no prefix, Next
  will not inline it into client bundles even by accident.
- `.env.local` is gitignored. `.env.local.example` is committed — `.gitignore` carries an explicit
  `!.env.local.example` exception, because the blanket `.env*` rule would otherwise hide it.
- Restart the dev server after editing; Next reads env files at boot.

---

## 5. Proxy (was: middleware)

**Next.js 16 renamed the `middleware` file convention to `proxy`.** Behaviour is identical, but a
root `middleware.js` is deprecated. Supabase's published guide still shows `middleware.ts` — the
equivalent in this project is **`proxy.js`** at the root.

Why it exists: Supabase access tokens are short-lived, and only an edge layer can write refreshed
cookies back to the browser. A Server Component cannot set cookies, so without the proxy the server
would keep reading an expired token and treat signed-in users as anonymous.

- `updateSession()` calls `supabase.auth.getUser()`, which revalidates the token and triggers the
  cookie refresh. `getSession()` only reads the cookie without verifying it and must not be used here.
- The matcher excludes `_next/static`, the image optimiser, `public/` asset folders and common file
  extensions. Without a matcher, Proxy runs on **every** request including CSS and images.
- `updateSession()` returns `{ response, user, configured }`. The proxy also applies the admin route
  guard — see [`admin.md` §9](./admin.md#9-authentication).
- **The proxy is an optimistic gate, not the security boundary.** Per the Next.js docs it runs
  before rendering for a fast redirect; the real check is in the `(shell)` layout, and every Server
  Action and Route Handler must verify the caller itself.
- A redirect built with `NextResponse.redirect()` starts with no cookies, so `withSessionCookies()`
  copies the refreshed session onto it. Without that, any request that both refreshes *and*
  redirects would sign the user out.

### Behaviour before configuration

`updateSession()` returns early when credentials are absent. The storefront is unaffected either
way. For `/admin` the behaviour is deliberately split:

| | Development | Production |
| --- | --- | --- |
| Supabase unconfigured | Dashboard browsable in **preview mode** | `/admin/*` redirects to the login screen |

Fail-open locally keeps UI work unblocked before keys exist; fail-closed in production means a
missing environment variable can never serve the dashboard to the public.

---

## 6. Cookies

`lib/supabase/cookies.js` marks every auth cookie **`httpOnly`**, plus `sameSite=lax` and `secure`
in production.

`@supabase/ssr` leaves these cookies readable by JavaScript so that `createBrowserClient` can pick
up the session. This app does not need that — all authenticated work happens server-side — so the
tokens are put out of reach of any XSS instead.

**The trade-off is deliberate:** while this is in place, `lib/supabase/client.js` cannot see the
session. A Client Component needing user-scoped data must call a Server Action rather than querying
Supabase directly. Revisit only if client-side realtime or RLS queries become necessary, and only
knowing it means accepting a script-readable token.

---

## 7. What is deliberately not built

No tables, migrations or SQL. No CRUD. No storage. Authentication exists (see
[`admin.md` §9](./admin.md#9-authentication)) but the data layer is still the static arrays in
`data/*.js`.

When the data layer starts, add `lib/api/*.js` fetchers that call these clients and map rows to the
shape in [`architecture.md` §4.1](./architecture.md#41-the-data-contract); no component should change.
