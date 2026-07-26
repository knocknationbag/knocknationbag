import Image from 'next/image'
import Link from 'next/link'

import Container from './Container'

/**
 * Desktop mega-menu panel. Rendered by Header inside the hovered/focused nav
 * item, so it opens on hover AND on keyboard focus (focus-within), with no JS.
 */
export default function MegaMenu({ menu, onNavigate }) {
  if (!menu) return null

  return (
    <div className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-[0_18px_40px_-24px_rgba(17,24,39,0.28)]">
      <Container className="grid grid-cols-[repeat(3,minmax(0,1fr))_320px] gap-10 py-10">
        {menu.columns.map((column) => (
          <div key={column.heading}>
            <p className="font-mono text-eyebrow uppercase text-gold">{column.heading}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className="text-[15px] text-body transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <Link
          href={menu.feature.href}
          onClick={onNavigate}
          className="group relative block h-[200px] overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <Image
            src={menu.feature.image}
            alt={menu.feature.imageAlt}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" aria-hidden="true" />
          <span className="absolute bottom-5 left-5">
            <span className="block font-mono text-eyebrow uppercase text-gold">{menu.feature.eyebrow}</span>
            <span className="mt-1 block text-[18px] font-bold text-white">{menu.feature.title}</span>
          </span>
        </Link>
      </Container>
    </div>
  )
}
