import Link from 'next/link'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { categories } from '@/data/categories'

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-20 text-center xl:py-32">
      <p className="font-mono text-eyebrow uppercase text-gold">Error 404</p>

      <h1 className="mt-4 text-display font-extrabold text-ink md:text-display-md xl:text-[96px] xl:leading-none">
        404
      </h1>

      <h2 className="mt-4 text-h2 font-extrabold text-ink md:text-h2-md">
        We could not find that page
      </h2>

      <p className="mt-4 max-w-[52ch] text-lead text-body">
        The link may be out of date, or the piece may have sold out and been retired. The full
        range is always one click away.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/shop" variant="primary" size="lg">Shop all bags</Button>
        <Button href="/" variant="secondary" size="lg">Back to home</Button>
      </div>

      <div className="mt-14 w-full max-w-[720px] border-t border-border pt-10">
        <p className="font-mono text-eyebrow uppercase text-gold">Or jump to a category</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="inline-block rounded-full border border-border px-4 py-2 text-[14px] text-ink transition-colors hover:border-border-hover hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {category.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
