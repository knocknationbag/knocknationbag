/**
 * Content for /brand. Every value here describes something that already
 * exists — nothing on the brand page is invented.
 *
 * `hex` is display text only; the swatch paints from the token class, so a
 * mismatch would be visible side by side. Keep `hex` in step with the @theme
 * block in app/globals.css (docs/design.md §3.1).
 *
 * Swatch classes are written out in full so Tailwind's scanner sees them.
 */

export const brandColors = [
  { name: 'Ink', token: 'ink', hex: '#111827', swatch: 'bg-ink', usage: 'Headings, prices, navigation and the footer.' },
  { name: 'Gold', token: 'gold', hex: '#D4AF37', swatch: 'bg-gold', usage: 'The single accent — primary buttons, eyebrows, badges.' },
  { name: 'Surface', token: 'surface', hex: '#FFFFFF', swatch: 'bg-surface', usage: 'Default page and card background.' },
  { name: 'Surface Muted', token: 'surface-muted', hex: '#F8FAFC', swatch: 'bg-surface-muted', usage: 'Alternating section bands.' },
  { name: 'Border', token: 'border', hex: '#E2E8F0', swatch: 'bg-border', usage: 'The one hairline, on every card and divider.' },
  { name: 'Body', token: 'body', hex: '#475569', swatch: 'bg-body', usage: 'Paragraph copy and supporting labels.' },
  { name: 'Muted', token: 'muted', hex: '#94A3B8', swatch: 'bg-muted', usage: 'Footer links, placeholders, quiet metadata.' },
]

/** The two lockups the site renders — see components/common/Logo.jsx. */
export const brandLogos = [
  { variant: 'default', surface: 'bg-surface', label: 'On light surfaces', note: 'Header, drawer and every light background.' },
  { variant: 'white', surface: 'bg-ink', label: 'On dark surfaces', note: 'The ink footer.' },
]

export const brandFonts = [
  { name: 'Outfit', role: 'Primary', weights: '300 – 800', usage: 'Headings and body copy', sampleClass: 'font-sans font-extrabold' },
  { name: 'Geist Mono', role: 'Annotation', weights: '400 – 500', usage: 'Eyebrows and badges', sampleClass: 'font-mono font-medium' },
]

/** Each specimen uses the exact classes the site uses for that role. */
export const typeSpecimens = [
  {
    role: 'Heading',
    spec: 'Outfit 800 · 24 / 34 / 42px',
    sample: 'Carry Confidence.',
    className: 'font-extrabold text-ink text-h2 md:text-h2-md xl:text-h2-xl',
  },
  {
    role: 'Subheading',
    spec: 'Outfit 700 · 16 / 17 / 18px',
    sample: 'Designed for Every Journey',
    className: 'font-bold text-ink text-card-title md:text-card-title-md xl:text-card-title-xl',
  },
  {
    role: 'Body',
    spec: 'Outfit 400 · 16 / 17 / 18px',
    sample:
      'Premium bags crafted for work, travel, everyday life, and modern lifestyles. Meticulously designed for ultimate utility and architectural style.',
    className: 'max-w-[60ch] text-lead text-body md:text-lead-md xl:text-lead-xl',
  },
  {
    role: 'Button',
    spec: 'Outfit 600 · 16px',
    sample: 'Shop Collection',
    className: 'font-semibold text-btn text-ink',
  },
  {
    role: 'Eyebrow',
    spec: 'Geist Mono 400 · 12px · uppercase',
    sample: 'Uncompromising Standard',
    className: 'font-mono text-eyebrow uppercase text-gold',
  },
]

/** Radius tokens from app/globals.css (docs/design.md §8). */
export const brandRadii = [
  { name: 'Badge', value: '6px', className: 'rounded-badge' },
  { name: 'Media', value: '12px', className: 'rounded-media' },
  { name: 'Card', value: '14px', className: 'rounded-card' },
  { name: 'Hero', value: '16px', className: 'rounded-hero' },
  { name: 'Button', value: 'Full', className: 'rounded-full' },
]
