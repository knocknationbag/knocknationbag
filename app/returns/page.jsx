import PolicyPage, { policyMetadata } from '@/components/common/PolicyPage'

export const metadata = policyMetadata('returns')

export default function Page() {
  return <PolicyPage slug="returns" />
}
