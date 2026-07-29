#!/usr/bin/env node
/**
 * Development seed — 3 users and 30 products.
 *
 *   node scripts/seed-dev-data.js
 *
 * Requires the migrations in supabase/migrations to have been applied; without
 * them there is nothing to write to and the script says so rather than failing
 * with a schema-cache error.
 *
 * Idempotent. Users are matched by email and products by slug, so re-running
 * updates the same 30 rows instead of accumulating 60. It never deletes, and it
 * never touches an account it did not create — the bootstrap Super Admin is
 * left exactly as it is.
 *
 * The dataset lives in seed-fixtures.js. This file only talks to Supabase.
 */

const { pathToFileURL } = require('node:url')
const path = require('node:path')

const { createServiceClient, findUserByEmail, report } = require('./service-client')
const fixtures = require('./seed-fixtures')

/**
 * lib/ is ES modules and this script is CommonJS, so the shared helpers are
 * pulled in with a dynamic import. They are reused rather than reimplemented:
 * a seed that slugs or scores differently from the app is a seed that hides
 * bugs instead of exposing them.
 */
async function loadAppHelpers() {
  // Node warns that lib/*.js declares no module type when CommonJS imports it.
  // The parse succeeds either way, and the alternative — "type": "module" in
  // package.json — would break every script in this folder.
  process.removeAllListeners('warning')
  process.on('warning', (warning) => {
    if (warning.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(warning)
  })

  const load = (file) => import(pathToFileURL(path.join(process.cwd(), file)).href)
  const [seo, tempPassword] = await Promise.all([
    load('lib/admin/seo.js'),
    load('lib/auth/tempPassword.js'),
  ])
  return { seo, generateTempPassword: tempPassword.generateTempPassword }
}

/**
 * A missing table means the migrations have not been applied yet.
 *
 * A real row select, not a `head: true` count: PostgREST answers a HEAD request
 * for a table that does not exist with 204 and no error, so a head probe
 * reports every schema as present and the seed only fails once it has already
 * created auth accounts.
 */
async function assertSchema(supabase) {
  const missing = []
  for (const table of ['profiles', 'products']) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) missing.push(`${table} (${error.message})`)
  }
  if (missing.length) {
    throw new Error(
      `Cannot reach ${missing.join(' and ')}.\n` +
        '  Apply supabase/migrations in filename order first — see supabase/README.md.',
    )
  }
}

/**
 * A profile row is keyed to auth.users.id, so a seeded user needs a real
 * sign-in account. The signup trigger creates the profile; the upsert below
 * fills in the fields auth.users has no place for.
 *
 * Re-running resets the password, so the value printed at the end is always the
 * one that works — the same reasoning as bootstrap-super-admin.js. Without it, a
 * run that failed partway would leave an account whose password no one holds.
 */
async function seedUsers(supabase, generateTempPassword, now) {
  const seeded = []

  for (const user of fixtures.users) {
    const password = generateTempPassword()
    const attributes = {
      password,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    }

    const existing = await findUserByEmail(supabase, user.email)
    let id = existing?.id

    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(id, attributes)
      if (error) throw new Error(`Could not update ${user.email}: ${error.message}`)
    } else {
      const { data, error } = await supabase.auth.admin.createUser({ email: user.email, ...attributes })
      if (error) throw new Error(`Could not create ${user.email}: ${error.message}`)
      id = data.user.id
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(fixtures.toUserRow(user, id, now), { onConflict: 'id' })
    if (error) throw new Error(`Could not write the profile for ${user.email}: ${error.message}`)

    seeded.push({ ...user, id, password })
  }

  return seeded
}

async function seedProducts(supabase, seo, now) {
  const rows = fixtures.products.map((product, index) => fixtures.toProductRow(product, index, seo, now))

  // One upsert, not thirty inserts: a partial seed that failed halfway is worse
  // to recover from than one that either lands or does not.
  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'slug' })
  if (error) throw new Error(`Could not write products: ${error.message}`)

  return rows
}

/** Read back rather than trusting the writes — this is what the dashboard sees. */
async function verify(supabase) {
  const counts = {}
  for (const table of ['profiles', 'products']) {
    const { count, error } = await supabase.from(table).select('*', { head: true, count: 'exact' })
    if (error) throw new Error(`Could not count ${table}: ${error.message}`)
    counts[table] = count ?? 0
  }
  return counts
}

async function main() {
  const { supabase, host } = createServiceClient()
  console.log(`Target project: ${host}`)

  await assertSchema(supabase)

  const { seo, generateTempPassword } = await loadAppHelpers()
  const now = Date.now()

  const users = await seedUsers(supabase, generateTempPassword, now)
  const products = await seedProducts(supabase, seo, now)
  const counts = await verify(supabase)

  const byStatus = products.reduce((acc, row) => ({ ...acc, [row.status]: (acc[row.status] ?? 0) + 1 }), {})
  const scores = products.map((row) => row.seo_score)
  const lowScores = products.filter((row) => row.seo_score < 80).map((row) => `${row.slug} (${row.seo_score})`)

  report([
    '  Development seed complete',
    '',
    `  Users seeded      ${users.length}`,
    ...users.map(
      (user) => `    ${user.name.padEnd(15)} ${user.email.padEnd(28)} ${user.status.padEnd(9)} ${user.password}`,
    ),
    '',
    `  Products seeded   ${products.length}`,
    `    by status       ${Object.entries(byStatus).map(([key, value]) => `${key} ${value}`).join('  ')}`,
    `    SEO score       ${Math.min(...scores)}–${Math.max(...scores)}`,
    '',
    '  Table totals (what /admin/users and /admin/products will show)',
    `    profiles        ${counts.profiles}`,
    `    products        ${counts.products}`,
    '',
    '  profiles includes the bootstrap Super Admin, which this script does not touch.',
    '',
    '  Development credentials. They are now in your shell history and this',
    '  terminal log — these accounts are for local use and nothing else.',
  ])

  if (lowScores.length) {
    console.warn(`Warning: low SEO scores — ${lowScores.join(', ')}\n`)
  }
}

main().catch((error) => {
  console.error(`\nSeed failed: ${error.message}\n`)
  process.exit(1)
})
