'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireDashboardUser } from '@/lib/auth/session'
import { generateTempPassword } from '@/lib/auth/tempPassword'
import { fromUser } from '@/lib/db/profiles'
import { friendlyDbError } from '@/lib/db/errors'
import { validateEmail } from '@/lib/auth/authErrors'

/**
 * User CRUD.
 *
 * Every action re-checks the session itself. The proxy and the shell layout
 * both gate rendering, but neither covers a POST to a Server Action — that is
 * the rule in docs/CLAUDE.md §19.
 *
 * Creating and deleting touch auth.users and therefore need the service-role
 * client. Profile edits go through the ordinary session client so Row Level
 * Security still applies.
 */

const CONSTRAINTS = {
  profiles_email_lower_key: 'Another user already has that email address.',
  profiles_status_check: 'Status must be Active or Inactive.',
}

const fail = (error, fieldErrors = {}) => ({ ok: false, error, fieldErrors })

function readForm(formData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim(),
    avatarUrl: String(formData.get('avatarUrl') ?? '').trim(),
    status: String(formData.get('status') ?? 'Active'),
  }
}

function validate(user) {
  const fieldErrors = {}
  if (!user.name) fieldErrors.name = 'Enter a name.'
  const emailError = validateEmail(user.email)
  if (emailError) fieldErrors.email = emailError
  if (user.phone && !/^[\d\s+()-]{6,20}$/.test(user.phone)) {
    fieldErrors.phone = 'Use digits, spaces and + ( ) - only.'
  }
  return fieldErrors
}

export async function createUser(_prevState, formData) {
  await requireDashboardUser()

  const user = readForm(formData)
  const fieldErrors = validate(user)
  if (Object.keys(fieldErrors).length) return fail('Check the highlighted fields.', fieldErrors)

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return fail('SUPABASE_SERVICE_ROLE_KEY is missing, so accounts cannot be created. See docs/supabase.md.')
  }

  const password = generateTempPassword()
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: user.name },
  })

  if (error) {
    if (error.code === 'email_exists') return fail('An account with that email already exists.', { email: 'Already in use.' })
    return fail(error.message)
  }

  // The signup trigger creates the profile row; fill in the fields it cannot know.
  const supabase = await createClient()
  const { error: profileError } = await supabase
    .from('profiles')
    .update(fromUser(user))
    .eq('id', data.user.id)

  if (profileError) {
    // Leaving an auth account with no usable profile behind would be worse than
    // failing outright, so undo the half-finished create.
    await admin.auth.admin.deleteUser(data.user.id)
    return fail(friendlyDbError(profileError, CONSTRAINTS))
  }

  revalidatePath('/admin/users')
  return { ok: true, id: data.user.id, tempPassword: password, email: user.email }
}

export async function updateUser(_prevState, formData) {
  await requireDashboardUser()

  const id = String(formData.get('id') ?? '')
  if (!id) return fail('Missing user id.')

  const user = readForm(formData)
  const fieldErrors = validate(user)
  if (Object.keys(fieldErrors).length) return fail('Check the highlighted fields.', fieldErrors)

  const supabase = await createClient()
  const { data: existing } = await supabase.from('profiles').select('email').eq('id', id).maybeSingle()

  // Keep the auth record and the profile in step — an email that changes in one
  // place only would let someone sign in with an address the dashboard denies.
  if (existing && existing.email.toLowerCase() !== user.email) {
    try {
      const admin = createAdminClient()
      const { error } = await admin.auth.admin.updateUserById(id, { email: user.email, email_confirm: true })
      if (error) return fail(`Could not update the sign-in email: ${error.message}`, { email: error.message })
    } catch {
      return fail('SUPABASE_SERVICE_ROLE_KEY is missing, so the sign-in email cannot be changed.')
    }
  }

  const { error } = await supabase.from('profiles').update(fromUser(user)).eq('id', id)
  if (error) return fail(friendlyDbError(error, CONSTRAINTS))

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return { ok: true, id }
}

export async function deleteUser(_prevState, formData) {
  const actor = await requireDashboardUser()
  const id = String(formData.get('id') ?? '')

  if (!id) return fail('Missing user id.')
  // Deleting your own account mid-session would sign you out of the dashboard
  // you are standing in, with no way back.
  if (id === actor.id) return fail('You cannot delete the account you are signed in with.')

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return fail(error.message)
  } catch {
    return fail('SUPABASE_SERVICE_ROLE_KEY is missing, so accounts cannot be deleted.')
  }

  revalidatePath('/admin/users')
  return { ok: true }
}
