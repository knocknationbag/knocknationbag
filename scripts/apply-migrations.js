#!/usr/bin/env node
/**
 * Applies supabase/migrations/*.sql over a direct Postgres connection.
 *
 *   SUPABASE_DB_URL="postgresql://..." node scripts/apply-migrations.js
 *
 * The service-role key cannot do this: PostgREST speaks tables and functions,
 * not DDL. Creating schema needs a real database connection, which is why this
 * is the one script that wants a connection string rather than an API key.
 *
 * The URL is read from the environment, never from a file and never from argv —
 * argv is visible to every process on the machine via the process list. It is
 * not logged, and the summary below prints only the host.
 *
 * Files run in filename order, each in its own transaction: a migration that
 * fails halfway leaves nothing behind rather than a half-built schema. The
 * migrations are written to be idempotent (`create ... if not exists`, `drop
 * policy if exists`), so re-running this is safe.
 */

const fs = require('node:fs')
const path = require('node:path')
const { Client } = require('pg')

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

const { report } = require('./service-client')

function migrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) throw new Error(`No such directory: ${MIGRATIONS_DIR}`)

  // Filenames are timestamp-prefixed, so a plain sort is dependency order —
  // products depends on set_updated_at() and is_admin() from profiles.
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

/**
 * Supabase's pooler presents a certificate that does not chain to the system
 * roots on every machine. Verification is tried first and only relaxed if that
 * is the reason the connection failed — so a real network or auth problem is
 * never silently retried into a weaker connection.
 */
async function connect(connectionString) {
  const attempt = async (ssl) => {
    const client = new Client({ connectionString, ssl })
    await client.connect()
    return client
  }

  try {
    return { client: await attempt({ rejectUnauthorized: true }), verified: true }
  } catch (error) {
    const isCertificateProblem =
      /self[- ]signed|unable to verify|certificate/i.test(error.message) ||
      String(error.code).startsWith('SELF_SIGNED') ||
      String(error.code).startsWith('UNABLE_TO_')

    if (!isCertificateProblem) throw error
    return { client: await attempt({ rejectUnauthorized: false }), verified: false }
  }
}

/** What the migrations were supposed to build, read back from the catalogue. */
async function inspect(client) {
  const tables = await client.query(`
    select c.relname as table,
           c.relrowsecurity as rls,
           (select count(*) from pg_policy p where p.polrelid = c.oid) as policies,
           (select count(*) from pg_index i where i.indrelid = c.oid) as indexes
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.relname
  `)

  const functions = await client.query(`
    select p.proname as name
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
    order by p.proname
  `)

  const triggers = await client.query(`
    select t.tgname as name, c.relname as table, n.nspname as schema
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal and n.nspname in ('public', 'auth')
    order by n.nspname, c.relname, t.tgname
  `)

  return { tables: tables.rows, functions: functions.rows, triggers: triggers.rows }
}

async function main() {
  const connectionString = (process.env.SUPABASE_DB_URL || '').trim()
  if (!connectionString) {
    throw new Error('Set SUPABASE_DB_URL to the Supabase connection string before running this.')
  }

  const files = migrationFiles()
  if (!files.length) throw new Error(`No .sql files in ${MIGRATIONS_DIR}`)

  const { host } = new URL(connectionString)
  console.log(`Target database: ${host}`)

  const { client, verified } = await connect(connectionString)
  if (!verified) {
    console.warn('Note: the server certificate could not be verified against the system roots.')
  }

  const applied = []
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      process.stdout.write(`  ${file} ... `)

      await client.query('begin')
      try {
        await client.query(sql)
        await client.query('commit')
      } catch (error) {
        await client.query('rollback')
        throw new Error(`${file} failed and was rolled back: ${error.message}`)
      }

      console.log('ok')
      applied.push(file)
    }

    const { tables, functions, triggers } = await inspect(client)

    report([
      '  Migrations applied',
      '',
      ...applied.map((file) => `    ${file}`),
      '',
      '  Tables in public',
      ...tables.map(
        (row) =>
          `    ${row.table.padEnd(10)} RLS ${row.rls ? 'on ' : 'off'}  ` +
          `${String(row.policies).padStart(2)} policies  ${String(row.indexes).padStart(2)} indexes`,
      ),
      '',
      `  Functions   ${functions.map((row) => row.name).join(', ') || '(none)'}`,
      ...triggers.map((row) => `  Trigger     ${row.schema}.${row.table} -> ${row.name}`),
    ])
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(`\nMigration failed: ${error.message}\n`)
  process.exit(1)
})
