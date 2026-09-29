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
          // Filter, sort and page variants of the listings. Every combination
          // is a distinct server-rendered URL, so left open they form an
          // unlimited crawl space. The plain listing URLs (/shop,
          // /category/<slug>, /collections/<slug>) and every product page stay
          // crawlable and are all in the sitemap. `*` is the standard robots
          // wildcard; `?` is literal, so only URLs with a query string match.
          '/shop?',
          '/category/*?',
          '/collections/*?',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  }
}
