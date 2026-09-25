import { ShieldCheck } from 'lucide-react'

import PageHeader from '@/components/common/PageHeader'
import BrandLogoSection from '@/components/brand/BrandLogoSection'
import BrandColorsSection from '@/components/brand/BrandColorsSection'
import BrandThemeSection from '@/components/brand/BrandThemeSection'
import BrandTypographySection from '@/components/brand/BrandTypographySection'
import { brandColors, brandFonts, brandLogos, brandRadii, typeSpecimens } from '@/data/brand'
import { features } from '@/data/features'

const DESCRIPTION =
  'The Knock Nation Bag brand identity — our logo, colour palette, website theme and typography.'

export const metadata = {
  title: 'Brand',
  description: DESCRIPTION,
  alternates: { canonical: '/brand' },
  openGraph: { title: 'Brand | Knock Nation Bag', description: DESCRIPTION, url: '/brand' },
}

/** Static: everything on this page is known at build time. */
export default function BrandPage() {
  return (
    <>
      <PageHeader
        eyebrow="BRAND IDENTITY"
        title="The Knock Nation Bag brand"
        description="The logo, colours, theme and type behind every page of the site — in one place."
        breadcrumbs={[{ label: 'Brand' }]}
      />

      <BrandLogoSection logos={brandLogos} />
      <BrandColorsSection colors={brandColors} />
      <BrandThemeSection feature={features[0]} featureIcon={ShieldCheck} radii={brandRadii} />
      <BrandTypographySection fonts={brandFonts} specimens={typeSpecimens} />
    </>
  )
}
