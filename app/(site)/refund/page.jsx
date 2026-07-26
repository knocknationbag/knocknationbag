import PolicyPage, { policyMetadata } from '@/components/common/PolicyPage'

export const metadata = policyMetadata('refund')

export default function Page() {
  return <PolicyPage slug="refund" />
}
