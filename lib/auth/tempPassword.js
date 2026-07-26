import crypto from 'node:crypto'

/**
 * Temporary password for a newly created account.
 *
 * A profile row is keyed to auth.users, so creating a user in the dashboard has
 * to create a real auth account — which needs a password. It is generated here,
 * shown once, and never stored anywhere by this app.
 *
 * Ambiguous glyphs (0/O, 1/l/I) are excluded because this gets read off a
 * screen and typed by hand at least once. crypto.randomInt throughout:
 * Math.random is biased and predictable.
 */
const SETS = [
  'abcdefghijkmnopqrstuvwxyz',
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  '23456789',
  '!@#$%^&*-_=+?',
]

const pick = (set) => set[crypto.randomInt(set.length)]

export function generateTempPassword(length = 20) {
  const every = SETS.join('')
  const chars = SETS.map(pick) // guarantee one of each class
  while (chars.length < length) chars.push(pick(every))

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
