/**
 * Shared plumbing for the standalone scripts in this folder.
 *
 * lib/supabase/admin.js is deliberately not reused: it is marked `server-only`
 * and throws outside a Next.js runtime. This is the equivalent for plain Node.
 *
 * The service-role key bypasses Row Level Security entirely. It is read from
 * .env.local and never printed.
 */

const fs = require('node:fs')
const path = require('node:path')
const { createClient } = require('@supabase/supabase-js')

/**
 * Minimal .env.local reader.
 *
 * Node's --env-file flag would also work, but parsing here keeps every script
 * runnable as plain `node scripts/<name>.js` with no flags. Comment lines never
 * match the pattern, so they are skipped for free.
 */
function loadEnvFile(file = '.env.local') {
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

/** A real environment variable wins over the file, so CI can override it. */
function envReader(file = '.env.local') {
  const fileEnv = loadEnvFile(file)
  return (key) => (process.env[key] || '').trim() || fileEnv[key] || ''
}

/**
 * Service-role client, plus the project URL so a script can report which
 * project it is about to write to before it writes anything.
 */
function createServiceClient() {
  const readEnv = envReader()
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')

  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean)

  if (missing.length) {
    throw new Error(`Missing ${missing.join(' and ')} in .env.local. See supabase/README.md.`)
  }

  const supabase = createClient(url, serviceKey, {
    // A service-role client represents no user, so there is no session to
    // persist or refresh. Leaving these on would write stray auth state.
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  return { supabase, url, host: new URL(url).host }
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

/** Boxed console output, so a script's result is not lost in scrollback. */
function report(lines) {
  const rule = '─'.repeat(62)
  console.log(`\n${rule}\n${lines.join('\n')}\n${rule}\n`)
}

module.exports = { loadEnvFile, envReader, createServiceClient, findUserByEmail, report }
