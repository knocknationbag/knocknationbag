import Image from 'next/image'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

/**
 * docs/responsive.md §4.2.
 * Desktop: text + 680x520 image. Tablet: text + 420x340. Mobile: full-bleed
 * image first, then copy, then two stacked full-width buttons.
 *
 * The image carries `order-first` only below md — the one sanctioned use of
 * order-* in this project (docs/design.md §16), because the mobile design
 * genuinely leads with the photograph.
 */
export default function HeroSection() {
  return (
    <section className="bg-surface pb-12 pt-0 md:pb-20 md:pt-16 xl:pb-[138px] xl:pt-[90px]">
      {/*
        Proportional columns, not fixed pixel widths. A fixed 680px image column
        held its size while the text column collapsed, so the 1000:680 balance
        inverted below 1920 (0.66:1 at 1366, wrapping the headline onto 5 lines).

        The integer ratios reproduce the reference exactly at its design widths
        and hold that proportion at every desktop size in between:
          md  39:35 -> at 1024 (928 container, 40 gap): 468 / 420
          xl  25:17 -> at 1920 (1760 container, 80 gap): 1000 / 680
      */}
      <Container className="grid items-center gap-8 md:grid-cols-[39fr_35fr] md:gap-10 xl:grid-cols-[25fr_17fr] xl:gap-20">
        {/* md:min-w-0 — a grid item defaults to min-width:auto, so the text column
            could not shrink below the button row's 411px min-content width. That
            floor was pushing the image column down to 221px at 768. */}
        <div className="order-last md:order-none md:min-w-0">
          <h1 className="font-extrabold text-display leading-tight text-ink md:text-display-md xl:text-display-xl">
            Carry Confidence.
            <br />
            <span className="text-gold">Designed for Every Journey.</span>
          </h1>

          <p className="mt-4 max-w-[460px] text-lead text-body md:text-lead-md xl:mt-4 xl:max-w-[420px] xl:text-lead-xl">
            Premium bags crafted for work, travel, everyday life, and modern lifestyles.
            Meticulously designed for ultimate utility and architectural style.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-6 md:gap-4 xl:mt-6">
            <Button href="/collections" variant="primary" size="lg" className="w-full sm:w-auto">
              Shop Collection
            </Button>
            <Button
              href="/collections/new-arrivals"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore New Arrivals
            </Button>
          </div>
        </div>

        <div className="order-first -mx-4 md:order-none md:mx-0">
          {/*
            Aspect ratio rather than a fixed height from md up. With a fluid
            column, a fixed 520px height forced object-cover to crop the sides
            as the column narrowed. 17:13 is the source's own ratio (680x520),
            so the frame scales instead of cropping and still resolves to
            exactly 680x520 at 1920. It also removes the 5.9% crop that was
            happening on tablet, where the 1.308 source sat in a 1.235 box.
          */}
          <div className="relative h-[300px] w-full overflow-hidden md:aspect-[17/13] md:h-auto md:rounded-hero">
            <Image
              src="/images/hero/hero-desktop.webp"
              alt="Black leather backpack and duffle bag arranged on a stone plinth"
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 45vw, 40vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
