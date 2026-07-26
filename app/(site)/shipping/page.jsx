import PolicyPage, { policyMetadata } from '@/components/common/PolicyPage'

export const metadata = policyMetadata('shipping')

export default function Page() {
  return <PolicyPage slug="shipping" />
}
