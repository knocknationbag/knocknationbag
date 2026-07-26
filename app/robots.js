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
          '/account',
          '/login',
          '/register',
          '/forgot-password',
          '/wishlist',
          '/search',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  }
}
