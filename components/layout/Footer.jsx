import Link from 'next/link'
import { Apple, CircleDollarSign, CreditCard } from 'lucide-react'

import Container from './Container'
import Logo from '@/components/common/Logo'
import SocialIcon from '@/components/common/SocialIcon'
import { footerColumns } from '@/constants/navigation'
import { paymentMethods, site, socialLinks } from '@/constants/site'

const PAYMENT_ICONS = { card: CreditCard, circles: CircleDollarSign, apple: Apple }

/**
 * docs/design.md §12. All three link columns render at every breakpoint —
 * the mobile mockup drops Policies; that is not reproduced (responsive.md §4.11).
 * `pb-28` on mobile clears the floating bottom navigation.
 */
export default function Footer() {
  return (
    <footer className="bg-ink pb-28 pt-12 md:pb-16 md:pt-16">
      <Container>
        {/*
          Column ratios measured from the reference: link columns start at
          1173/1417/1661 (desktop, 64px gaps) and 461/649/837 (tablet, 48px gaps),
          which makes the brand column far wider than an even 2fr/1fr/1fr/1fr split.
        */}
        <div className="grid gap-10 md:grid-cols-[2.6fr_1fr_1fr_1fr] md:gap-x-12 md:gap-y-8 xl:grid-cols-[5.75fr_1fr_1fr_1fr] xl:gap-x-16">
          <div>
            <Logo variant="white" size={38} href={null} />
            <p className="mt-5 max-w-[340px] text-[14px] leading-[21px] text-muted">
              {site.footerDescription}
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-footer-heading font-bold text-white">{column.heading}</h2>
              <ul className="mt-4">
                {column.links.map((link) => (
                  <li key={link.href} className="leading-[28px]">
                    <Link
                      href={link.href}
                      className="text-footer-link text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="mt-10 border-white/10 xl:mt-14" />

        <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
          <p className="order-last text-[14px] text-muted md:order-none">
            Copyright © {site.copyrightYear} {site.name}. All rights reserved.
          </p>

          <ul className="flex items-center gap-2" aria-label="Accepted payment methods">
            {paymentMethods.map((method) => {
              const Icon = PAYMENT_ICONS[method.icon]
              return (
                <li
                  key={method.label}
                  className="grid h-[26px] w-[38px] place-items-center rounded-badge bg-footer-chip"
                >
                  <Icon size={16} strokeWidth={2} className="text-muted" aria-hidden="true" />
                  <span className="sr-only">{method.label}</span>
                </li>
              )
            })}
          </ul>

          <ul className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${social.label}`}
                  className="inline-grid size-11 place-items-center rounded-full text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:size-6"
                >
                  <SocialIcon name={social.icon} size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
