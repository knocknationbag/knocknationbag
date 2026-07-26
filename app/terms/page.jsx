import PolicyPage, { policyMetadata } from '@/components/common/PolicyPage'

export const metadata = policyMetadata('terms')

export default function Page() {
  return <PolicyPage slug="terms" />
}
