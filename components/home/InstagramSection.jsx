import Image from 'next/image'

import Section from '@/components/layout/Section'
import SectionHeader from '@/components/common/SectionHeader'
import Container from '@/components/layout/Container'
import { site } from '@/constants/site'

/**
 * docs/responsive.md §4.9 — 6 tiles at every breakpoint.
 * Desktop is the only place the strip breaks the container: full width with a
 * fixed 32px gutter. Tablet and mobile stay inside the normal container.
 */
export default function InstagramSection({ posts }) {
  return (
    <Section background="surface" bleed>
      <Container>
        <SectionHeader eyebrow="SARTORIAL EXPRESSION" title={`Follow ${site.instagramHandle}`} />
      </Container>

      <ul className="grid grid-cols-3 gap-3 px-4 md:grid-cols-4 md:px-12 xl:grid-cols-6 xl:px-8">
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              // The tile links off-site, so the accessible name states the
              // destination as well as the scene (docs/accessibility.md §4).
              // The image is then decorative to avoid a duplicate announcement.
              aria-label={`${post.imageAlt}. View on Instagram (opens in a new tab).`}
              className="group relative block h-[140px] overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:h-[180px] xl:h-[220px]"
            >
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(max-width: 767px) 33vw, (max-width: 1279px) 25vw, 17vw"
                className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
              />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
