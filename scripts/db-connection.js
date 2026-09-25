/**
 * Direct Postgres connection for the schema scripts (apply-migrations,
 * db-inspect).
 *
 * The service-role key cannot do this: PostgREST speaks tables and functions,
 * not DDL or the system catalogue. Reading and changing schema needs a real
 * database connection, which is why these are the only scripts that want a
 * connection string rather than an API key.
 *
 * SUPABASE_DB_URL is read from the environment first, then .env.local. It is
 * never read from argv (visible to every process via the process list), never
 * logged, and nothing here prints more than the project ref and host.
 */

const { Client } = require('pg')

const { envReader } = require('./service-client')

/** The project ref, from either an API URL or a Postgres connection string. */
function projectRefFromApiUrl(apiUrl) {
  const match = new URL(apiUrl).hostname.match(/^([a-z0-9]{20})\.supabase\.(co|in)$/)
  return match ? match[1] : null
}

function projectRefFromDbUrl(dbUrl) {
  const { hostname: host, username } = new URL(dbUrl)
  // Direct connection: db.<ref>.supabase.co, user "postgres".
  const direct = host.match(/^db\.([a-z0-9]{20})\.supabase\.(co|in)$/)
  if (direct) return direct[1]
  // Pooler (session or transaction): user "postgres.<ref>".
  const pooled = decodeURIComponent(username).match(/^[a-z_]+\.([a-z0-9]{20})$/)
  return pooled ? pooled[1] : null
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

/**
 * Connects to the database behind SUPABASE_DB_URL, refusing if it belongs to a
 * different Supabase project than the one the app talks to. A migration run
 * against the wrong project is the one mistake these scripts must not allow.
 */
async function connectToProjectDatabase() {
  const readEnv = envReader()
  const connectionString = readEnv('SUPABASE_DB_URL')
  const apiUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')

  if (!connectionString) {
    throw new Error(
      'Set SUPABASE_DB_URL (in the environment or .env.local) to the Supabase connection string. ' +
        'See supabase/README.md.',
    )
  }

  let dbRef
  try {
    dbRef = projectRefFromDbUrl(connectionString)
  } catch {
    // The URL parser's message can echo the input — never pass it on.
    throw new Error('SUPABASE_DB_URL is not a valid postgresql:// connection string.')
  }

  const appRef = apiUrl ? projectRefFromApiUrl(apiUrl) : null
  if (!dbRef) throw new Error('Could not read a Supabase project ref from SUPABASE_DB_URL.')
  if (appRef && dbRef !== appRef) {
    throw new Error(
      `SUPABASE_DB_URL points at project ${dbRef}, but NEXT_PUBLIC_SUPABASE_URL is project ${appRef}. ` +
        'Refusing to continue.',
    )
  }

  const { hostname: host } = new URL(connectionString)
  const { client, verified } = await connect(connectionString)

  console.log(`Project ${dbRef} (${host})`)
  if (!verified) console.warn('Note: the server certificate could not be verified against the system roots.')

  return client
}

module.exports = { connectToProjectDatabase }
