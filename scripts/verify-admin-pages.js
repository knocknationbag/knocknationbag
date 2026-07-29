#!/usr/bin/env node
/**
 * End-to-end check that /admin/products and /admin/users render database rows.
 *
 *   node scripts/verify-admin-pages.js [baseUrl]
 *
 * Reading the tables directly proves the data is in Supabase. It does not prove
 * the pages read it — a page still wired to data/products.js would look
 * identical. So this signs in for real and asserts against the rendered HTML.
 *
 * The session cookies are minted by @supabase/ssr itself rather than
 * hand-assembled: the cookie name, encoding and chunking are its business, and
 * a hand-rolled cookie that happened to work would prove nothing about the app.
 *
 * Development-only. It signs in as the Super Admin, so it needs that password.
 */

const { createServerClient } = require('@supabase/ssr')

const { envReader } = require('./service-client')

const BASE_URL = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const EMAIL = 'knocknationbag@gmail.com'

/** Signs in and returns the Cookie header the app will accept. */
async function signIn(password) {
  const readEnv = envReader()
  const jar = new Map()

  const supabase = createServerClient(
    readEnv('NEXT_PUBLIC_SUPABASE_URL'),
    readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
        setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
      },
    },
  )

  const { error } = await supabase.auth.signInWithPassword({ email: EMAIL, password })
  if (error) throw new Error(`Could not sign in as ${EMAIL}: ${error.message}`)
  if (!jar.size) throw new Error('Sign-in succeeded but set no cookies.')

  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
}

/**
 * The rendered markup, with every <script> removed.
 *
 * Without this, assertions are meaningless. React serialises the whole props
 * tree into the RSC flight payload inside <script> tags, so every SKU appears
 * twice and `emptyTitle="No products yet"` is present in the HTML of a page
 * showing thirty products. Only what survives this strip was actually rendered.
 */
async function fetchPage(path, cookie) {
  const response = await fetch(`${BASE_URL}${path}`, { headers: { cookie }, redirect: 'manual' })
  if (response.status >= 300 && response.status < 400) {
    throw new Error(`${path} redirected to ${response.headers.get('location')} — not signed in?`)
  }
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)

  const html = await response.text()
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
}

const results = []
const check = (label, passed, detail = '') => {
  results.push({ label, passed, detail })
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
}

/** Count non-overlapping occurrences of a literal string. */
const countOf = (haystack, needle) => haystack.split(needle).length - 1

/** Distinct SKUs rendered in a table — one per product row. */
const skusIn = (html) => [...new Set(html.match(/KNB-[A-Z]{3}-\d{4}/g) ?? [])]

async function main() {
  const password = (process.env.SUPER_ADMIN_PASSWORD || '').trim()
  if (!password) throw new Error('Set SUPER_ADMIN_PASSWORD (see scripts/bootstrap-super-admin.js).')

  const cookie = await signIn(password)
  console.log(`Signed in as ${EMAIL}\nChecking ${BASE_URL}\n`)

  // --- Products -----------------------------------------------------------
  const page1 = await fetchPage('/admin/products', cookie)
  const page2 = await fetchPage('/admin/products?page=2', cookie)
  const page3 = await fetchPage('/admin/products?page=3', cookie)

  check('products: total reported as 30', /\b30\b/.test(page1), 'count rendered in the toolbar')
  check('products: page 1 shows the newest 10', skusIn(page1).length === 10, `${skusIn(page1).length} rows`)
  check('products: page 2 shows 10 more', skusIn(page2).length === 10, `${skusIn(page2).length} rows`)
  check('products: page 3 shows the last 10', skusIn(page3).length === 10, `${skusIn(page3).length} rows`)

  const allPaged = [...skusIn(page1), ...skusIn(page2), ...skusIn(page3)]
  check(
    'products: the 3 pages are 30 distinct products',
    new Set(allPaged).size === 30,
    `${new Set(allPaged).size} unique SKUs across pages 1-3`,
  )

  check(
    'products: seeded rows are the rendered rows',
    page1.includes('Monarch Leather Backpack') && page1.includes('KNB-BKP-1001'),
    'name and SKU from the products table',
  )
  check(
    'products: images come from the seeded featured_image',
    page1.includes('rosewood-daypack'),
    'featured_image path present in markup',
  )

  // Nothing in data/products.js carries a SKU or a status, so a page still
  // reading the in-memory catalogue could not render either.
  check(
    'products: not the in-memory catalogue',
    page1.includes('Executive Office Laptop Bag') && !page1.includes('Apex Duffle Pro'),
    'seeded names present, data/products.js names absent',
  )

  const search = await fetchPage('/admin/products?q=backpack', cookie)
  check('products: search "backpack" narrows the list', skusIn(search).length === 9, `${skusIn(search).length} matches`)

  const skuSearch = await fetchPage('/admin/products?q=KNB-TRV', cookie)
  check(
    'products: search by SKU works',
    skusIn(skuSearch).length === 6 && skusIn(skuSearch).every((sku) => sku.startsWith('KNB-TRV')),
    `${skusIn(skuSearch).length} hits, all KNB-TRV`,
  )

  const filtered = await fetchPage('/admin/products?status=Draft', cookie)
  check('products: status filter works', skusIn(filtered).length === 3, `${skusIn(filtered).length} drafts`)

  // A search that matches nothing is not the same as an empty table, and the
  // module says so: "No matching records" when filters are active, the
  // page's own emptyTitle only when the table itself is empty.
  const noMatch = await fetchPage('/admin/products?q=zzzznotathing', cookie)
  check(
    'products: empty state appears on a genuinely empty result',
    skusIn(noMatch).length === 0 && /No matching records/i.test(noMatch),
    'filtered empty state, not "No products yet"',
  )
  check('products: empty state gone when rows exist', !/No products|No matching records/i.test(page1))

  // --- Users --------------------------------------------------------------
  const users = await fetchPage('/admin/users', cookie)
  const seeded = ['John Smith', 'Emma Wilson', 'Michael Brown']

  check('users: all 3 seeded users render', seeded.every((name) => users.includes(name)), seeded.join(', '))
  check('users: emails render from profiles', users.includes('john.smith@example.com'))
  check('users: phone renders from profiles', users.includes('555-0142'))
  check('users: avatar_url renders', users.includes('john-smith'))
  check('users: status renders both values', users.includes('Inactive') && users.includes('Active'))
  check('users: Super Admin is listed too', users.includes('knocknationbag@gmail.com'))
  check('users: empty state gone', !/No users/i.test(users))

  const userSearch = await fetchPage('/admin/users?q=emma', cookie)
  check(
    'users: search "emma" narrows to one',
    userSearch.includes('Emma Wilson') && !userSearch.includes('Michael Brown'),
  )

  const inactive = await fetchPage('/admin/users?status=Inactive', cookie)
  check(
    'users: status filter works',
    inactive.includes('Michael Brown') && !inactive.includes('Emma Wilson'),
  )

  // --- Not the setup panel ------------------------------------------------
  check(
    'neither page shows the "database not set up" panel',
    !/not set up/i.test(page1) && !/not set up/i.test(users),
  )

  const failed = results.filter((result) => !result.passed)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed\n`)
  if (failed.length) process.exit(1)
}

main().catch((error) => {
  console.error(`\nVerification failed: ${error.message}\n`)
  process.exit(1)
})
