import PolicyPage, { policyMetadata } from '@/components/common/PolicyPage'

export const metadata = policyMetadata('warranty')

export default function Page() {
  return <PolicyPage slug="warranty" />
}
