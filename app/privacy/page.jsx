import PolicyPage, { policyMetadata } from '@/components/common/PolicyPage'

export const metadata = policyMetadata('privacy')

export default function Page() {
  return <PolicyPage slug="privacy" />
}
