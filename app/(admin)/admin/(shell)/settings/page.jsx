import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import StoreSettingsForm from '@/components/admin/settings/StoreSettingsForm'
import { createClient } from '@/lib/supabase/server'
import { toSettings } from '@/lib/checkout/pricing'

export const metadata = { title: 'Settings' }

/** The settings V1 needs to take orders: shipping, GST, Cash on Delivery. */
export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle()

  return (
    <>
      <AdminPageHeader title="Settings" description="Shipping charges, GST and payment methods for checkout." />
      <StoreSettingsForm settings={toSettings(data)} />
    </>
  )
}
