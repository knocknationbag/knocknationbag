#!/usr/bin/env node
/**
 * Prints the live schema of the app's tables, read from the Postgres catalogue.
 *
 *   node scripts/db-inspect.js
 *
 * Read-only: everything runs inside a READ ONLY transaction, so this cannot
 * change the database even by accident. Use it to check that the files in
 * supabase/migrations still describe what is actually deployed — before
 * recording history with --mark-applied, and whenever drift is suspected.
 *
 * Covers public tables, columns, constraints, indexes, RLS, policies, table
 * grants to the API roles, functions, triggers (including the one on
 * auth.users), extensions and migration history. Extension-owned functions
 * (pg_trgm's) are left out: they belong to the extension, not to a migration.
 */

const { connectToProjectDatabase } = require('./db-connection')

const API_ROLES = ['anon', 'authenticated', 'service_role']

const QUERIES = {
  extensions: `
    select e.extname as name, n.nspname as schema, e.extversion as version
    from pg_extension e join pg_namespace n on n.oid = e.extnamespace
    where e.extname not in ('plpgsql')
    order by 1`,

  tables: `
    select c.relname as name, c.relrowsecurity as rls, c.relforcerowsecurity as force_rls,
           obj_description(c.oid, 'pg_class') as comment
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
    order by 1`,

  columns: `
    select a.attrelid::regclass::text as table, a.attname as name,
           format_type(a.atttypid, a.atttypmod) as type, a.attnotnull as not_null,
           pg_get_expr(d.adbin, d.adrelid) as default,
           col_description(a.attrelid, a.attnum) as comment
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
    where n.nspname = 'public' and c.relkind in ('r', 'p') and a.attnum > 0 and not a.attisdropped
    order by 1, a.attnum`,

  constraints: `
    select conrelid::regclass::text as table, conname as name, pg_get_constraintdef(oid) as definition
    from pg_constraint
    where connamespace = 'public'::regnamespace and conrelid <> 0
    order by 1, 2`,

  indexes: `
    select tablename as table, indexname as name, indexdef as definition
    from pg_indexes where schemaname = 'public'
    order by 1, 2`,

  policies: `
    select tablename as table, policyname as name, cmd, roles::text[] as roles,
           permissive, qual as using, with_check
    from pg_policies where schemaname = 'public'
    order by 1, 2`,

  grants: `
    select table_name as table, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee = any($1)
    group by 1, 2 order by 1, 2`,

  functions: `
    select p.oid::regprocedure::text as signature, pg_get_functiondef(p.oid) as definition,
           array(select a::text from unnest(coalesce(p.proacl, '{}')) a) as acl
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
    order by 1`,

  triggers: `
    select n.nspname || '.' || c.relname as table, t.tgname as name, pg_get_triggerdef(t.oid) as definition,
           case t.tgenabled when 'D' then 'disabled' else 'enabled' end as state
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal
      and (n.nspname = 'public'
           or t.tgfoid in (select oid from pg_proc where pronamespace = 'public'::regnamespace))
    order by 1, 2`,

  rowCounts: `
    select 'profiles' as table, count(*)::int as rows from public.profiles
    union all select 'products', count(*)::int from public.products`,
}

function section(title, lines) {
  console.log(`\n== ${title}`)
  for (const line of lines.length ? lines : ['(none)']) console.log(line)
}

async function main() {
  const client = await connectToProjectDatabase()
  const run = async (key, params) => (await client.query(QUERIES[key], params)).rows

  try {
    await client.query('begin read only')

    section('Extensions', (await run('extensions')).map((r) => `  ${r.name} ${r.version} in schema ${r.schema}`))

    section(
      'Tables',
      (await run('tables')).map(
        (r) => `  ${r.name}  RLS ${r.rls ? 'on' : 'OFF'}${r.force_rls ? ' (forced)' : ''}  -- ${r.comment || ''}`,
      ),
    )

    section(
      'Columns',
      (await run('columns')).map(
        (r) =>
          `  ${r.table}.${r.name}  ${r.type}${r.not_null ? ' not null' : ''}` +
          `${r.default ? ` default ${r.default}` : ''}${r.comment ? `  -- ${r.comment}` : ''}`,
      ),
    )

    section('Constraints', (await run('constraints')).map((r) => `  ${r.table}  ${r.name}  ${r.definition}`))
    section('Indexes', (await run('indexes')).map((r) => `  ${r.definition}`))

    section(
      'Policies',
      (await run('policies')).map(
        (r) =>
          `  ${r.table}  "${r.name}"  ${r.cmd} to ${r.roles.join(', ')}${r.permissive === 'PERMISSIVE' ? '' : ' RESTRICTIVE'}` +
          `${r.using ? `\n      using ${r.using}` : ''}${r.with_check ? `\n      with check ${r.with_check}` : ''}`,
      ),
    )

    section('Table grants', (await run('grants', [API_ROLES])).map((r) => `  ${r.table}  ${r.grantee}: ${r.privileges}`))

    section(
      'Functions',
      (await run('functions')).map(
        (r) => `  ${r.signature}  acl ${r.acl.length ? r.acl.join(' ') : '(default)'}\n${r.definition.trimEnd()}\n`,
      ),
    )

    section('Triggers', (await run('triggers')).map((r) => `  ${r.table}  ${r.name} (${r.state})\n      ${r.definition}`))

    const { rows: history } = await client.query(
      `select to_regclass('supabase_migrations.schema_migrations') is not null as present`,
    )
    const versions = history[0].present
      ? (await client.query('select version, name from supabase_migrations.schema_migrations order by 1')).rows
      : null
    section(
      'Migration history',
      versions === null ? ['  not recorded (no supabase_migrations.schema_migrations table)'] : versions.map((r) => `  ${r.version}_${r.name}`),
    )

    section('Row counts', (await run('rowCounts')).map((r) => `  ${r.table}: ${r.rows}`))

    await client.query('rollback')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(`\nInspect failed: ${error.message}\n`)
  process.exit(1)
})
