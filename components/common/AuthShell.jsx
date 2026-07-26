import Image from 'next/image'
import Link from 'next/link'

import Logo from './Logo'

/**
 * Split layout shared by login, register and forgot-password so the three auth
 * screens cannot drift apart. Right panel is decorative and hidden below xl.
 */
export default function AuthShell({ title, description, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-80px)] xl:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-14 md:px-12 xl:px-20">
        <div className="w-full max-w-[420px]">
          <Logo size={38} className="mb-10 xl:hidden" />

          <h1 className="text-h2 font-extrabold text-ink md:text-h2-md">{title}</h1>
          {description ? <p className="mt-3 text-[15px] leading-[26px] text-body">{description}</p> : null}

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-8 text-[15px] text-body">{footer}</div> : null}

          <p className="mt-10 text-[13px] text-body">
            This is a static demonstration. No account is created and nothing is submitted. Read our{' '}
            <Link href="/privacy" className="font-semibold text-ink underline underline-offset-4 hover:text-gold">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="relative hidden xl:block">
        <Image
          src="/images/lifestyle/ig-08-stairwell-noir.webp"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
        />
        <span className="absolute inset-0 bg-ink/45" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-16">
          <p className="font-mono text-eyebrow uppercase text-gold">CARRY CONFIDENCE</p>
          <p className="mt-4 max-w-[26ch] text-[32px] font-extrabold leading-tight text-white">
            Designed for every journey.
          </p>
        </div>
      </div>
    </div>
  )
}
