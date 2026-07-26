import { Outfit, Geist_Mono } from 'next/font/google'

import JsonLd from '@/components/common/JsonLd'
import { site, socialLinks } from '@/constants/site'

import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://knocknationbag.com'),
  title: {
    default: 'Knock Nation Bag — Premium Bags for Work, Travel & Modern Life',
    template: '%s | Knock Nation Bag',
  },
  description:
    'Premium bags crafted for work, travel, everyday life, and modern lifestyles. ' +
    'Meticulously designed for ultimate utility and architectural style.',
  applicationName: 'Knock Nation Bag',
  keywords: ['premium bags', 'leather backpack', 'travel luggage', 'laptop bag', 'messenger bag'],
  authors: [{ name: 'Knock Nation Bag' }],
  openGraph: {
    type: 'website',
    siteName: 'Knock Nation Bag',
    locale: 'en_US',
    url: '/',
    title: 'Knock Nation Bag — Premium Bags for Work, Travel & Modern Life',
    description:
      'Premium bags crafted for work, travel, everyday life, and modern lifestyles.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@knocknationbag',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: { icon: '/logo/favicon.svg' },
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/logo/kn-monogram.svg`,
      description: site.description,
      sameAs: socialLinks.map((social) => social.href),
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { '@id': `${site.url}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${site.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable}`}>
      <body>
        <JsonLd data={organizationLd} />

        {/*
          Chrome lives in the route-group layouts, not here: app/(site) renders
          the storefront header/footer, app/(admin) renders the dashboard shell.
          The root layout owns only <html>, fonts and sitewide structured data.
        */}
        {children}
      </body>
    </html>
  )
}
