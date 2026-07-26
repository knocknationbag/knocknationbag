/** Editorial content for the non-catalogue pages. Becomes the CMS boundary later. */

export const faqs = [
  {
    group: 'Orders & Delivery',
    items: [
      {
        q: 'How long will my order take to arrive?',
        a: 'Standard delivery arrives in 3–5 working days and is free on orders over $150. Express delivery arrives next working day when ordered before 2pm. International orders take 7–12 working days depending on destination and customs clearance.',
      },
      {
        q: 'Can I change my delivery address after ordering?',
        a: 'Yes, provided the order has not entered fulfilment. Contact us within two hours of placing the order and we will update it. Once a parcel has a tracking number the address is locked by the carrier.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'We ship to 42 countries. Duties and import taxes are calculated and collected at checkout for most destinations, so nothing is owed on delivery.',
      },
    ],
  },
  {
    group: 'Returns & Warranty',
    items: [
      {
        q: 'What is your returns window?',
        a: 'Thirty days from delivery, for any reason, provided the piece is unused and carries its tags. Return shipping is free within the United States and a flat $12 elsewhere.',
      },
      {
        q: 'What does the three-year warranty cover?',
        a: 'Every manufacturing defect: stitching, hardware, zips, linings and structural failure. It does not cover ordinary wear, accidental damage or the natural patina leather develops. Repairs are free within the warranty period.',
      },
      {
        q: 'Can I have a bag repaired after the warranty ends?',
        a: 'Yes. Our workshop repairs any Knock Nation Bag piece for life at cost. Send us photographs and we will quote before starting work.',
      },
    ],
  },
  {
    group: 'Products & Care',
    items: [
      {
        q: 'How should I care for vegetable-tanned leather?',
        a: 'Keep it dry, let it develop a patina, and condition it two or three times a year with a neutral cream. Avoid silicone-based products, which seal the surface and prevent the leather ageing properly.',
      },
      {
        q: 'Are your bags waterproof?',
        a: 'Our coated canvas and ballistic nylon pieces are water-resistant and will handle sustained rain. Leather pieces are treated but not waterproof — wipe them dry and let them air rather than using direct heat.',
      },
      {
        q: 'Do you offer monogramming?',
        a: 'Blind debossing in up to three characters is available on all full-grain leather pieces at no cost. Add it in the cart. Monogrammed pieces can still be returned within the standard window.',
      },
    ],
  },
]

export const aboutStats = [
  { value: '2019', label: 'Founded in Lisbon' },
  { value: '42', label: 'Countries served' },
  { value: '21', label: 'Point quality check' },
  { value: '3 yr', label: 'Warranty as standard' },
]

export const aboutValues = [
  {
    title: 'Structure first',
    body: 'A bag is an architectural problem before it is a fashion one. We design the frame, the load path and the opening geometry before we choose a hide.',
  },
  {
    title: 'Materials that age',
    body: 'We choose vegetable-tanned leather, waxed canvas and solid brass because they improve with use. Materials that only ever look worse are not on our bench.',
  },
  {
    title: 'Repair over replace',
    body: 'Every piece is repairable for life at cost. A bag that comes back to the workshop twice in twenty years is a success, not a failure.',
  },
]

/**
 * Founder section on the About page.
 * Placeholder identity — swap `name` and `portrait` for the real founder.
 * Copy is written pronoun-free so it stays accurate whoever it is replaced with.
 */
export const founder = {
  eyebrow: 'OUR FOUNDER',
  heading: 'Building Confidence Through Every Journey',
  subheading:
    'A bag should earn its place on your shoulder for a decade, not a season. That conviction is where Knock Nation Bag started, and it still settles every decision we make.',
  name: 'Rafael Duarte',
  role: 'Founder & Creative Director',
  portrait: '/images/about/founder-portrait.webp',
  portraitAlt:
    'Rafael Duarte, Founder and Creative Director of Knock Nation Bag, photographed against a neutral studio backdrop',
  quote:
    'We are not trying to make a bag you love on the day it arrives. We are making the one you still reach for in ten years.',
  story: [
    'The brand began in 2019 with a repaired bag rather than a new one. A twelve-year-old leather holdall, split at the seam, that three shops declined to touch because replacing it was cheaper than mending it. That answer felt like the wrong one — and it turned out to be the whole brief.',
    'So we started at the frame. Before a hide is chosen or a colourway approved, we settle the structure: where the load travels, how the opening behaves when the bag is half empty, which four points will take the abuse. Design that begins with the silhouette can only ever hide its weaknesses. Design that begins with the structure does not have any to hide.',
    'That standard is easier to promise than to keep, so we made it measurable. Every piece leaves the Lisbon workshop through the same twenty-one-point check, and every piece carries a three-year warranty against anything we got wrong. After that we repair it for life at cost, because the alternative is asking someone to throw away something we told them would last.',
    'The people who buy from us tend to buy once and then write to us years later — about a strap that needs replacing, or a trip the bag survived. Those letters shape the next season far more than any trend report. We would rather be told what failed than be flattered.',
    'What comes next is more of the same discipline, applied wider: fewer pieces, released when they are finished rather than when the calendar says so, and a repair service that reaches every one of the forty-two countries we ship to. Growth is welcome. It is simply not the point.',
  ],
}

export const contactChannels = [
  { label: 'Customer care', value: 'care@knocknationbag.com', href: 'mailto:care@knocknationbag.com' },
  { label: 'Press & partnerships', value: 'press@knocknationbag.com', href: 'mailto:press@knocknationbag.com' },
  { label: 'Telephone', value: '+1 (555) 018 4420', href: 'tel:+15550184420' },
]

/**
 * Legal and policy pages. One route template renders all of these
 * (app/(content)/[policy]/page.jsx), so there are no dead footer links.
 */
export const policies = {
  shipping: {
    title: 'Shipping Policy',
    updated: 'January 2025',
    intro:
      'How and when we despatch orders, what it costs, and what happens if something goes wrong in transit.',
    sections: [
      {
        heading: 'Despatch times',
        body: [
          'Orders placed before 2pm on a working day are despatched the same day. Orders placed after that, or at a weekend or public holiday, are despatched the next working day.',
          'Monogrammed pieces add one working day to despatch because the debossing is done by hand in the workshop.',
        ],
      },
      {
        heading: 'Delivery options and cost',
        body: [
          'Standard delivery: 3–5 working days. Free on orders over $150, otherwise $8.',
          'Express delivery: next working day when ordered before 2pm. $18.',
          'International delivery: 7–12 working days. Calculated at checkout by destination.',
        ],
      },
      {
        heading: 'Duties and import taxes',
        body: [
          'For most destinations we collect duties and import taxes at checkout, so nothing further is owed on delivery. Where we cannot collect in advance, this is stated clearly before payment.',
        ],
      },
      {
        heading: 'Lost or damaged parcels',
        body: [
          'Every shipment is insured for its full value. If a parcel is lost or arrives damaged, contact us within 14 days of the expected delivery date and we will replace it or refund you in full. We handle the carrier claim ourselves.',
        ],
      },
    ],
  },
  returns: {
    title: 'Return Policy',
    updated: 'January 2025',
    intro: 'Thirty days, any reason, with free return shipping within the United States.',
    sections: [
      {
        heading: 'The window',
        body: [
          'You have 30 days from the date of delivery to start a return. The piece must be unused and carry its original tags. Original packaging is appreciated but not required.',
        ],
      },
      {
        heading: 'How to return',
        body: [
          'Start a return from your account, or email care@knocknationbag.com with your order number. We issue a prepaid label within one working day.',
          'Return shipping is free within the United States. Elsewhere a flat $12 is deducted from the refund.',
        ],
      },
      {
        heading: 'What cannot be returned',
        body: [
          'Monogrammed pieces can be returned within the standard window, but gift cards and care products that have been opened cannot.',
        ],
      },
      {
        heading: 'Exchanges',
        body: [
          'We do not process direct exchanges, because it delays you twice. Return the original for a refund and place a new order — the refund is issued as soon as the return is scanned by the carrier, not when it reaches us.',
        ],
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    updated: 'January 2025',
    intro: 'When refunds are issued, how they are paid, and how long they take to appear.',
    sections: [
      {
        heading: 'Timing',
        body: [
          'Refunds are issued as soon as your return is scanned by the carrier, not when it arrives with us. Funds typically appear within 3–5 working days depending on your bank.',
        ],
      },
      {
        heading: 'Method',
        body: [
          'Refunds are returned to the original payment method. Where that method has expired or been cancelled, we issue store credit or arrange a bank transfer.',
        ],
      },
      {
        heading: 'Partial refunds',
        body: [
          'If a returned piece shows use beyond reasonable inspection, we may issue a partial refund. We always contact you with photographs before doing so, and you may have the piece returned to you instead.',
        ],
      },
      {
        heading: 'Original shipping cost',
        body: [
          'Where shipping was paid, it is refunded in full if the return is due to a fault or an error on our part. For change-of-mind returns the original shipping charge is retained.',
        ],
      },
    ],
  },
  warranty: {
    title: 'Warranty',
    updated: 'January 2025',
    intro: 'Three years against manufacturing defects, and lifetime repair at cost thereafter.',
    sections: [
      {
        heading: 'What is covered',
        body: [
          'For three years from purchase we cover every manufacturing defect: stitching failure, hardware breakage, zip failure, lining separation and structural collapse. Repair or replacement is free, including shipping both ways.',
        ],
      },
      {
        heading: 'What is not covered',
        body: [
          'Ordinary wear, accidental damage, misuse, and the natural patina and softening that leather develops with use. Patina is the material working as intended, not a defect.',
        ],
      },
      {
        heading: 'After three years',
        body: [
          'Our workshop repairs any Knock Nation Bag piece for life at cost — you pay materials and postage, not labour. Send photographs to care@knocknationbag.com and we will quote before starting.',
        ],
      },
      {
        heading: 'Making a claim',
        body: [
          'Email us with your order number and photographs of the issue. We assess within two working days and send a prepaid label if the claim is accepted.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'January 2025',
    intro: 'What we collect, why we collect it, and the control you have over it.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Information you give us: name, delivery and billing address, email, telephone number and order history.',
          'Information collected automatically: device type, browser, pages viewed and approximate location derived from IP address.',
        ],
      },
      {
        heading: 'Why we collect it',
        body: [
          'To fulfil and deliver orders, to handle returns and warranty claims, to prevent fraud, and — only where you have opted in — to send marketing email.',
          'We do not sell personal data, and we do not share it with third parties except the processors required to run the shop: payment, delivery and email providers.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Essential cookies keep your cart and session working and cannot be switched off. Analytics and marketing cookies are optional and off until you accept them.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request a copy of your data, ask us to correct or delete it, or withdraw consent to marketing at any time. Email care@knocknationbag.com and we respond within 30 days.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    updated: 'January 2025',
    intro: 'The terms on which we sell to you.',
    sections: [
      {
        heading: 'Forming a contract',
        body: [
          'Your order is an offer to buy. A contract is formed when we send the despatch confirmation email, not when payment is taken. If we cannot fulfil an order we refund you in full and explain why.',
        ],
      },
      {
        heading: 'Pricing and availability',
        body: [
          'Prices are shown in US dollars and include applicable taxes where stated. We correct pricing errors when we find them; if a price was clearly wrong we contact you before despatch and you may cancel.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'You may not resell our products as new without written permission, scrape the site, or use our photography and copy without a licence.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'Nothing in these terms limits liability for death, personal injury or fraud. Otherwise our liability is limited to the value of the order concerned.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are governed by the laws of the State of New York, and disputes are subject to the exclusive jurisdiction of its courts.',
        ],
      },
    ],
  },
}

export const policySlugs = Object.keys(policies)
