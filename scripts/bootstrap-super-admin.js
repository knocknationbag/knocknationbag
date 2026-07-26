#!/usr/bin/env node
/**
 * Temporary development bootstrap — ensures one Super Admin account exists.
 *
 *   node scripts/bootstrap-super-admin.js
 *
 * Roles currently live in the JWT (`app_metadata.role`), not in a table, so
 * there is no SQL to run and nothing here creates schema. When RBAC moves to a
 * database this script is replaced, not extended.
 *
 * Idempotent: creates the user, or updates it if the email already exists.
 * Re-running also resets the password, so the value printed at the end is
 * always the one that works — a printed password that had silently stopped
 * being valid would be worse than no output at all.
 *
 * Uses the service-role key, which bypasses Row Level Security entirely. It is
 * read from .env.local and never printed. lib/supabase/admin.js is deliberately
 * not reused: it is marked `server-only` and throws outside a Next.js runtime.
 */

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { createClient } = require('@supabase/supabase-js')

const EMAIL = 'knocknationbag@gmail.com'
const ROLE = 'super-admin'
const PASSWORD_LENGTH = 24

/**
 * Minimal .env.local reader.
 *
 * Node's --env-file flag would also work, but parsing here keeps the script
 * runnable as plain `node scripts/bootstrap-super-admin.js` with no flags.
 * Comment lines never match the pattern, so they are skipped for free.
 */
function loadEnvFile(file) {
  const full = path.join(process.cwd(), file)
  if (!fs.existsSync(full)) return {}

  const values = {}
  for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (/^(".*"|'.*')$/.test(value)) value = value.slice(1, -1)
    values[match[1]] = value
  }
  return values
}

const fileEnv = loadEnvFile('.env.local')
const readEnv = (key) => (process.env[key] || '').trim() || fileEnv[key] || ''

// Ambiguous glyphs (0/O, 1/l/I) are excluded — this password gets read off a
// terminal and typed by hand at least once.
const SETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digit: '23456789',
  symbol: '!@#$%^&*-_=+?',
}

const pick = (set) => set[crypto.randomInt(set.length)]

/** crypto.randomInt throughout: Math.random is biased and predictable. */
function generatePassword(length = PASSWORD_LENGTH) {
  const every = Object.values(SETS).join('')
  const chars = Object.values(SETS).map(pick) // guarantee one of each class
  while (chars.length < length) chars.push(pick(every))

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

/** supabase-js has no get-by-email, so page through the admin list. */
async function findUserByEmail(supabase, email) {
  const target = email.toLowerCase()
  const perPage = 200

  for (let page = 1; page <= 25; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`Could not list users: ${error.message}`)

    const found = data.users.find((user) => (user.email || '').toLowerCase() === target)
    if (found) return found
    if (data.users.length < perPage) return null
  }
  return null
}

function report(lines) {
  const rule = '─'.repeat(62)
  console.log(`\n${rule}\n${lines.join('\n')}\n${rule}\n`)
}

async function main() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')

  const missing = [!url && 'NEXT_PUBLIC_SUPABASE_URL', !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean)
  if (missing.length) {
    throw new Error(`Missing ${missing.join(' and ')} in .env.local. See docs/supabase.md.`)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  const password = generatePassword()
  const attributes = { password, email_confirm: true, app_metadata: { role: ROLE } }

  console.log(`Target project: ${new URL(url).host}`)

  let user = await findUserByEmail(supabase, EMAIL)
  let action

  if (user) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, attributes)
    if (error) throw new Error(`Could not update ${EMAIL}: ${error.message}`)
    action = 'updated'
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email: EMAIL, ...attributes })

    // Lost a race, or the account exists in a state the listing did not return.
    if (error?.code === 'email_exists') {
      user = await findUserByEmail(supabase, EMAIL)
      if (!user) throw new Error(`${EMAIL} reported as existing but could not be found.`)
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, attributes)
      if (updateError) throw new Error(`Could not update ${EMAIL}: ${updateError.message}`)
      action = 'updated'
    } else if (error) {
      throw new Error(`Could not create ${EMAIL}: ${error.message}`)
    } else {
      user = data.user
      action = 'created'
    }
  }

  // Read back rather than trusting the write — this is the same claim the
  // dashboard gates on, so it is worth confirming it actually landed.
  const saved = await findUserByEmail(supabase, EMAIL)
  const roleOk = saved?.app_metadata?.role === ROLE
  const confirmedOk = Boolean(saved?.email_confirmed_at)

  report([
    `  Super Admin bootstrap: ${action.toUpperCase()}`,
    '',
    `  Email      ${EMAIL}`,
    `  Password   ${password}`,
    `  Role       ${saved?.app_metadata?.role ?? '(missing)'}  ${roleOk ? 'OK' : 'NOT SET'}`,
    `  Confirmed  ${confirmedOk ? 'yes' : 'no'}`,
    `  User id    ${saved?.id ?? user?.id ?? '(unknown)'}`,
    '',
    action === 'updated' ? '  Account already existed — password above is a fresh reset.' : '  Account created.',
    '  Sign in at /admin/login',
    '',
    '  Temporary development credential. It is now in your shell',
    '  history and this terminal log — rotate it before this project',
    '  is exposed to anyone else, and never commit it.',
  ])

  if (!roleOk || !confirmedOk) {
    throw new Error('Bootstrap finished but verification failed — see the flags above.')
  }
}

main().catch((error) => {
  console.error(`\nBootstrap failed: ${error.message}\n`)
  process.exit(1)
})
