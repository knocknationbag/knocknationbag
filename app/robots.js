import { site } from '@/constants/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/cart',
          '/checkout',
          '/order/',
          '/account',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/admin',
          '/search',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  }
}
