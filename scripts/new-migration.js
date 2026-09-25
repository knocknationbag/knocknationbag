#!/usr/bin/env node
/**
 * Creates an empty, correctly named migration file.
 *
 *   npm run db:new -- add_product_weight
 *
 * Writes supabase/migrations/<UTC yyyymmddhhmmss>_<name>.sql — the naming the
 * Supabase CLI and apply-migrations.js both expect. The timestamp is forced
 * past the newest existing file, so a new migration always sorts last.
 */

const fs = require('node:fs')
const path = require('node:path')

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

function utcStamp(date) {
  return date.toISOString().replace(/\D/g, '').slice(0, 14)
}

function main() {
  const name = (process.argv[2] || '').trim()
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new Error('Usage: npm run db:new -- <snake_case_name>   e.g. add_product_weight')
  }

  const latest = fs
    .readdirSync(MIGRATIONS_DIR)
    .map((file) => file.match(/^(\d{14})_/)?.[1])
    .filter(Boolean)
    .sort()
    .at(-1)

  let version = utcStamp(new Date())
  if (latest && version <= latest) version = String(BigInt(latest) + 1n)

  const file = path.join(MIGRATIONS_DIR, `${version}_${name}.sql`)
  fs.writeFileSync(
    file,
    [
      '-- ============================================================================',
      `-- ${name}`,
      '--',
      '-- What this changes and why. Applied migrations are never edited — change',
      '-- the schema again with a new file.',
      '-- ============================================================================',
      '',
      '',
    ].join('\n'),
    { flag: 'wx' },
  )

  console.log(`Created ${path.relative(process.cwd(), file)}`)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
