'use client'

import { createBrowserClient } from '@supabase/ssr'

import { requireSupabaseEnv } from './env'

/**
 * Supabase client for Client Components.
 *
 * Uses the public anon key only — every request is subject to Row Level
 * Security. Never import lib/supabase/admin.js from a client component.
 *
 *   'use client'
 *   import { createClient } from '@/lib/supabase/client'
 *   const supabase = createClient()
 *
 * createBrowserClient memoises internally, so calling this per component is
 * cheap and does not open duplicate connections.
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv()
  return createBrowserClient(url, anonKey)
}
