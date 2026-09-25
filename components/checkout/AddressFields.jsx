import Field from '@/components/ui/Field'
import { INDIAN_STATES } from '@/constants/india'

/**
 * Indian delivery address fields. `prefix` namespaces the inputs so the same
 * block serves delivery and billing in one form.
 */
export default function AddressFields({ prefix = '', values = {}, errors = {}, idPrefix = 'addr' }) {
  const name = (key) => `${prefix}${key}`
  const field = (key) => ({
    id: `${idPrefix}-${key}`,
    name: name(key),
    defaultValue: values[name(key)] ?? '',
    error: errors[name(key)],
  })

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field {...field('fullName')} label="Full name" autoComplete="name" required />
      <Field {...field('phone')} type="tel" inputMode="tel" label="Mobile number" autoComplete="tel" placeholder="10-digit mobile" required />
      <Field {...field('line1')} label="House / flat, street" autoComplete="address-line1" className="md:col-span-2" required />
      <Field {...field('line2')} label="Area, landmark (optional)" autoComplete="address-line2" className="md:col-span-2" />
      <Field {...field('city')} label="City / town" autoComplete="address-level2" required />
      <Field {...field('pincode')} inputMode="numeric" maxLength={6} label="PIN code" autoComplete="postal-code" required />
      <Field {...field('state')} as="select" label="State" autoComplete="address-level1" className="md:col-span-2" required>
        <option value="">Choose a state</option>
        {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
      </Field>
    </div>
  )
}
