#!/usr/bin/env node
/**
 * Applies pending supabase/migrations/*.sql files and records each one.
 *
 *   node scripts/apply-migrations.js                  apply pending migrations
 *   node scripts/apply-migrations.js --status         list applied / pending, change nothing
 *   node scripts/apply-migrations.js --mark-applied <version> [...]
 *                                                     record as applied WITHOUT running
 *
 * The connection string comes from SUPABASE_DB_URL — see db-connection.js.
 *
 * History lives in supabase_migrations.schema_migrations, the table the
 * Supabase CLI uses, so `supabase migration list` / `supabase db push` agree
 * with this script if the project is ever linked with the CLI.
 *
 * Each migration runs in its own transaction together with its history row:
 * either the schema change and its record both land, or neither does. An
 * applied migration is never run again, so migrations do not have to be
 * idempotent — but they must never be edited once applied. Change the schema
 * with a new file (`npm run db:new -- <name>`).
 *
 * --mark-applied exists for one case: a migration whose changes are already in
 * the database (applied by hand, or before history was tracked). It records the
 * version without executing anything. Check with `npm run db:inspect` first.
 */

const fs = require('node:fs')
const path = require('node:path')

const { connectToProjectDatabase } = require('./db-connection')
const { report } = require('./service-client')

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')
const FILE_PATTERN = /^(\d{14})_([a-z0-9_]+)\.sql$/

function localMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) throw new Error(`No such directory: ${MIGRATIONS_DIR}`)

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith('.sql'))
  const malformed = files.filter((file) => !FILE_PATTERN.test(file))
  if (malformed.length) {
    throw new Error(`Migration filenames must be <14-digit timestamp>_<snake_name>.sql: ${malformed.join(', ')}`)
  }

  // Timestamp-prefixed, so a plain sort is dependency order.
  return files.sort().map((file) => {
    const [, version, name] = file.match(FILE_PATTERN)
    return { version, name, file, sql: fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8') }
  })
}

/**
 * Same shape the Supabase CLI creates. The CLI adds further nullable columns
 * of its own with `add column if not exists`, so creating the base here does
 * not conflict with it.
 */
async function ensureHistoryTable(client) {
  await client.query(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (version text primary key);
    alter table supabase_migrations.schema_migrations add column if not exists statements text[];
    alter table supabase_migrations.schema_migrations add column if not exists name text;
  `)
}

/** Applied versions, or null when history has never been recorded. */
async function appliedMigrations(client) {
  const { rows: exists } = await client.query(
    `select to_regclass('supabase_migrations.schema_migrations') is not null as present`,
  )
  if (!exists[0].present) return null

  const { rows } = await client.query(
    'select version, name, statements from supabase_migrations.schema_migrations order by version',
  )
  return new Map(rows.map((row) => [row.version, row]))
}

async function hasUserTables(client) {
  const { rows } = await client.query(`
    select exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p')
    ) as present
  `)
  return rows[0].present
}

/**
 * This script stores the whole file as one statement, so an applied file can
 * be checked for later edits. Rows written by the CLI hold split statements
 * and are not compared.
 */
function editedSinceApplied(local, row) {
  const statements = row.statements || []
  return statements.length === 1 && statements[0] !== local.sql
}

function statusLines(locals, applied) {
  const lines = []
  for (const local of locals) {
    const row = applied?.get(local.version)
    const state = !row ? 'pending' : editedSinceApplied(local, row) ? 'applied — FILE EDITED SINCE' : 'applied'
    lines.push(`    ${local.file.padEnd(44)} ${state}`)
  }
  const localVersions = new Set(locals.map((local) => local.version))
  for (const [version, row] of applied || []) {
    if (!localVersions.has(version)) lines.push(`    ${`${version}_${row.name || '?'}`.padEnd(44)} in database, NO LOCAL FILE`)
  }
  return lines
}

async function applyPending(client, locals, applied) {
  const pending = locals.filter((local) => !applied.has(local.version))
  if (!pending.length) {
    console.log('Nothing to apply — the database is up to date.')
    return []
  }

  const done = []
  for (const local of pending) {
    process.stdout.write(`  ${local.file} ... `)
    await client.query('begin')
    try {
      await client.query(local.sql)
      await client.query(
        'insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)',
        [local.version, local.name, [local.sql]],
      )
      await client.query('commit')
    } catch (error) {
      await client.query('rollback')
      console.log('failed')
      throw new Error(`${local.file} failed and was rolled back: ${error.message}`)
    }
    console.log('ok')
    done.push(local.file)
  }
  return done
}

async function markApplied(client, locals, applied, versions) {
  if (!versions.length) throw new Error('--mark-applied needs at least one migration version.')

  const byVersion = new Map(locals.map((local) => [local.version, local]))
  const unknown = versions.filter((version) => !byVersion.has(version))
  if (unknown.length) throw new Error(`No local migration file for: ${unknown.join(', ')}`)

  const marked = []
  await client.query('begin')
  try {
    for (const version of versions) {
      if (applied.has(version)) continue
      const local = byVersion.get(version)
      await client.query(
        'insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)',
        [local.version, local.name, [local.sql]],
      )
      marked.push(local.file)
    }
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  }
  return marked
}

async function main() {
  const args = process.argv.slice(2)
  const mode = args.includes('--status') ? 'status' : args.includes('--mark-applied') ? 'mark' : 'apply'

  const locals = localMigrations()
  if (!locals.length) throw new Error(`No .sql files in ${MIGRATIONS_DIR}`)

  const client = await connectToProjectDatabase()
  try {
    if (mode === 'status') {
      const applied = await appliedMigrations(client)
      report([
        applied ? '  Migration history' : '  Migration history — not recorded yet (no history table)',
        '',
        ...statusLines(locals, applied),
      ])
      return
    }

    const before = await appliedMigrations(client)
    if (mode === 'apply' && !before?.size && (await hasUserTables(client))) {
      throw new Error(
        'The database already has tables in public but no migration history. Applying now would re-run ' +
          'migrations that are already live. Verify with `npm run db:inspect`, then record them with ' +
          '`node scripts/apply-migrations.js --mark-applied <version> ...`.',
      )
    }

    await ensureHistoryTable(client)
    let applied = await appliedMigrations(client)

    if (mode === 'mark') {
      const versions = args.filter((arg) => !arg.startsWith('--'))
      const marked = await markApplied(client, locals, applied, versions)
      console.log(marked.length ? `Recorded without running: ${marked.join(', ')}` : 'Already recorded.')
    } else {
      await applyPending(client, locals, applied)
    }

    applied = await appliedMigrations(client)
    report(['  Migration history', '', ...statusLines(locals, applied)])
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(`\nMigration failed: ${error.message}\n`)
  process.exit(1)
})
