import Image from 'next/image'
import Link from 'next/link'

import Logo from '@/components/common/Logo'

/**
 * Frame shared by all four admin auth screens.
 *
 * The image panel is purely decorative — image, gradient and monogram, no copy.
 * That is deliberate: it lets the panel drop below `lg` without breaking the
 * project's rule that content is identical at every breakpoint (docs/responsive.md).
 * Every word on these screens lives in the form column and is visible at 390px.
 */
export default function AuthShell({ title, description, children, footer }) {
  return (
    <div className="grid min-h-svh bg-surface lg:grid-cols-[1fr_minmax(440px,44%)]">
      {/*
        Decorative brand panel. The product shot is presented *contained* in a
        frame rather than as a full-bleed cover: it is 680 × 520, and covering a
        tall panel would upscale it ~1.7× and crop the plinth out of frame.
        Framed, it is downscaled and stays sharp.
      */}
      <div
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-gradient-to-b from-footer-chip to-ink lg:block"
      >
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-12">
          <Logo variant="white" size={40} href={null} />

          <Image
            src="/images/hero/hero-desktop.webp"
            alt=""
            width={680}
            height={520}
            priority
            sizes="(max-width: 1279px) 42vw, 46vw"
            className="w-full max-w-[520px] self-center rounded-hero border border-white/10 shadow-2xl"
          />

          {/* Spacer, so the plate sits optically centred between logo and base. */}
          <div className="h-10" />
        </div>
      </div>

      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:border-l lg:border-border">
        <div className="mx-auto w-full max-w-[400px]">
          <Logo size={38} href="/" className="lg:hidden" />

          <div className="mt-8 lg:mt-0">
            <p className="font-mono text-admin-xs uppercase tracking-[0.14em] text-muted">
              Knock Nation Bag · Admin
            </p>
            <h1 className="mt-2 text-admin-stat font-extrabold tracking-tight text-ink">{title}</h1>
            {description ? (
              <p className="mt-1.5 text-admin leading-[20px] text-body">{description}</p>
            ) : null}
          </div>

          <div className="mt-6">{children}</div>

          {footer ? <div className="mt-5">{footer}</div> : null}

          <p className="mt-8 border-t border-border pt-4 text-admin-xs text-muted">
            Staff access only.{' '}
            <Link
              href="/"
              className="font-medium text-body underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Return to knocknationbag.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
