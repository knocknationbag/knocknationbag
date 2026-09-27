/** Editorial content for the non-catalogue pages. Becomes the CMS boundary later. */

export const faqs = [
  {
    group: 'Orders & Delivery',
    items: [
      {
        q: 'Where do you deliver?',
        a: 'We deliver across India. Orders are for delivery addresses in India only.',
      },
      {
        q: 'How much does delivery cost?',
        a: 'The delivery charge for your order — and whether it ships free — is shown in your cart and at checkout before you pay.',
      },
      {
        q: 'How can I pay?',
        a: 'Pay online (UPI, cards, net banking and wallets, secured by Razorpay) or choose Cash on Delivery where it is available.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order is shipped, the courier name and tracking number appear on your order page.',
      },
      {
        q: 'Can I change my delivery address after ordering?',
        a: 'Email us at knocknationbag@gmail.com with your order number as soon as possible, before the order is shipped.',
      },
    ],
  },
  {
    group: 'Returns & Warranty',
    items: [
      {
        q: 'Can I return an order?',
        a: 'Yes, if you are not satisfied with the product. Click Return Order on your order page within 7 days of receipt. The product must be unused, in the same condition as received, in its original packaging and accompanied by the invoice. Returns are for domestic orders only.',
      },
      {
        q: 'Do I pay for return shipping?',
        a: 'No. For domestic orders our courier partner collects the product from your address. Please do not ship the product before you receive confirmation from our team.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed after the returned product reaches our warehouse and passes inspection. Online payments are refunded through the same payment method where supported, within 10–15 working days from receipt of the returned product at the warehouse.',
      },
      {
        q: 'Can I exchange or replace a product?',
        a: 'Exchanges and replacements are not available.',
      },
      {
        q: 'What warranty do your products have?',
        a: 'Every product has different warranty rules depending on the category and specifications.',
      },
    ],
  },
  {
    group: 'Products & Orders',
    items: [
      {
        q: 'What kinds of bags do you make?',
        a: 'We manufacture all types of bags in our own workshop: school bags, college bags and backpacks, laptop bags, and customized bags with your logo, colours, and design.',
      },
      {
        q: 'Can I order customized bags with my logo?',
        a: 'Yes — your logo, your colours, your design. From a single piece to bulk orders, every bag goes through careful stitching and quality checks before it leaves our workshop. Contact us for our latest catalogue and rates.',
      },
      {
        q: 'Do you take wholesale and bulk orders?',
        a: 'Yes. Bulk orders and single pieces are both welcome. We supply schools, colleges, companies, shops and resellers all over India.',
      },
    ],
  },
]

/** About page — the client's own words. Do not rewrite the facts. */
export const about = {
  story: {
    heading: 'Our Story',
    paragraphs: [
      "Knock Nation's story began in 2002, when Mr. Noor Alam Shaikh, born in Bihar, India, opened a small bag shop in Byculla, Mumbai, with one simple goal: to make strong, good-quality bags at fair prices.",
      'More than two decades later, we are still running from the same place where it all started. That first shop grew into KN and Antic Bags, the company behind our brand KNOCK NATION, and the idea behind it has never changed: every bag should be made to last.',
    ],
  },
  make: {
    heading: 'What We Make',
    intro: 'We manufacture all types of bags in our own workshop:',
    items: [
      { id: 'school', title: 'School Bags' },
      { id: 'college', title: 'College Bags & Backpacks' },
      { id: 'laptop', title: 'Laptop Bags' },
      { id: 'custom', title: 'Customized Bags', body: 'with your logo, colours, and design' },
    ],
    outro: 'From a single piece to bulk orders, every bag goes through careful stitching and quality checks before it leaves our workshop.',
  },
  supply: {
    heading: 'Supplying All Over India',
    body: 'From our home in Byculla, Mumbai, we supply bags to schools, colleges, companies, shops, and resellers all over India. Whether you run a store, need bags for your institution, or want branded bags for your company, we deliver to your city.',
  },
  why: {
    heading: 'Why Choose Knock Nation',
    items: [
      { id: 'since', title: 'Since 2002', body: 'More than 20 years of bag-making experience' },
      { id: 'direct', title: 'Direct from the manufacturer', body: 'No middlemen, better rates' },
      { id: 'custom', title: 'Custom orders', body: 'Your logo, your colours, your design' },
      { id: 'wholesale', title: 'Wholesale & retail', body: 'Bulk orders and single pieces, both welcome' },
      { id: 'india', title: 'Pan-India supply', body: 'Delivery across the country' },
    ],
  },
  together: {
    heading: "Let's Work Together",
    body: 'Whether you need one bag or a thousand, we would love to make it for you. Contact us on WhatsApp for our latest catalogue and rates.',
    tagline: 'KNOCK NATION: Quality Bags Since 2002.',
  },
}

export const contactChannels = [
  { label: 'Email', value: 'knocknationbag@gmail.com', href: 'mailto:knocknationbag@gmail.com' },
]

/**
 * Legal and policy pages. One route template renders all of these
 * (app/(content)/[policy]/page.jsx), so there are no dead footer links.
 */
export const policies = {
  shipping: {
    title: 'Shipping Policy',
    updated: 'September 2026',
    intro: 'Where we deliver, what delivery costs, and how to follow your order.',
    sections: [
      {
        heading: 'Where we deliver',
        body: [
          'We deliver to addresses across India. We do not ship outside India.',
        ],
      },
      {
        heading: 'Delivery charges',
        body: [
          'The delivery charge for your order, and whether your order qualifies for free delivery, is shown in your cart and at checkout before you pay.',
        ],
      },
      {
        heading: 'Payment',
        body: [
          'Pay online (UPI, cards, net banking and wallets, secured by Razorpay) or choose Cash on Delivery where it is available. For Cash on Delivery, please keep the order amount ready for the courier.',
        ],
      },
      {
        heading: 'Tracking your order',
        body: [
          'Once your order is shipped, the courier name and tracking number appear on your order page. Signed-in customers also find every order under My Account.',
        ],
      },
      {
        heading: 'Damaged or defective products',
        body: [
          'Defects must be reported within 7 days of receipt. Use Return Order on your order page, as set out in our Return and Exchange Policy.',
        ],
      },
    ],
  },
  returns: {
    title: 'Return and Exchange Policy',
    updated: 'September 2026',
    intro: 'Customers can return an order if they are not satisfied with the product.',
    sections: [
      {
        heading: 'Return conditions',
        body: [
          'Defective products must be unused, in the same condition as received, in original packaging, and accompanied by the invoice.',
          'Defects must be reported within 7 days of receipt.',
          'Returns are available for domestic orders only.',
        ],
      },
      {
        heading: 'Return shipping',
        body: [
          'For domestic orders, our courier partner collects the product from your address. You do not pay return shipping charges.',
        ],
      },
      {
        heading: 'Return process',
        body: [
          '1. Click Return Order on your order page within 7 days from receipt.',
          '2. Do not ship the product before you receive confirmation from our team.',
          '3. The product must be unused and unaltered.',
          '4. Include the original packaging, tags and invoice.',
          '5. Requests after 7 days cannot be accepted.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'A refund is processed only after the returned product reaches our warehouse. The product is inspected there, and if it satisfies the return conditions, the refund is initiated.',
          'Online payments are refunded through the same payment method where supported. Online refunds are processed within 10–15 working days from receipt of the returned product at the warehouse.',
        ],
      },
      {
        heading: 'Exchanges and replacements',
        body: ['Exchange and replacement are not available.'],
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    updated: 'September 2026',
    intro: 'When refunds for returned products are processed, and how they are paid.',
    sections: [
      {
        heading: 'When a refund is made',
        body: [
          'A refund is processed only after the returned product reaches our warehouse. The product is inspected, and if it satisfies the return conditions in our Return and Exchange Policy, the refund is initiated.',
        ],
      },
      {
        heading: 'How it is paid',
        body: [
          'Online payments are refunded through the same payment method where supported. Online refunds are processed within 10–15 working days from receipt of the returned product at the warehouse.',
        ],
      },
      {
        heading: 'Exchanges and replacements',
        body: ['Exchange and replacement are not available.'],
      },
    ],
  },
  warranty: {
    title: 'Warranty',
    updated: 'September 2026',
    intro: 'Every product has different warranty rules depending on the category and specifications.',
    sections: [
      {
        heading: 'Warranty on your product',
        body: [
          'Every product has different warranty rules depending on the category and specifications. Contact us with your order number to confirm the rules for your product.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'September 2026',
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
          'To fulfil and deliver orders, to handle returns and refunds, and to prevent fraud.',
          'We do not sell personal data, and we do not share it with third parties except the processors required to run the shop: payment (Razorpay), delivery and email providers.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Essential cookies keep your cart and sign-in working.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request a copy of your data, or ask us to correct or delete it. Email knocknationbag@gmail.com.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    updated: 'September 2026',
    intro: 'The terms on which we sell to you through this website.',
    sections: [
      {
        heading: 'Orders',
        body: [
          'Placing an order is an offer to buy. For online payment, the order is confirmed once the payment is verified. For Cash on Delivery, payment is collected when the order is delivered.',
          'If we cannot fulfil an order, we will contact you, and any online payment for it is refunded through the same payment method where supported.',
        ],
      },
      {
        heading: 'Prices and availability',
        body: [
          'Prices are in Indian rupees (₹). Where GST applies it is shown at checkout. Delivery charges and any coupon discount are shown before you pay.',
          'Products are subject to availability. Stock is checked again when you place your order.',
        ],
      },
      {
        heading: 'Delivery',
        body: [
          'We deliver to addresses in India only. See our Shipping Policy.',
        ],
      },
      {
        heading: 'Coupons',
        body: [
          'Coupons are subject to their own conditions — such as a minimum order amount, an expiry date and usage limits — which are checked when the coupon is applied and again when the order is placed.',
        ],
      },
      {
        heading: 'Returns, refunds and warranty',
        body: [
          'Returns and refunds are handled under our Return and Exchange Policy. Exchange and replacement are not available.',
          'Every product has different warranty rules depending on the category and specifications.',
        ],
      },
      {
        heading: 'Use of this website',
        body: [
          'You may not resell our products as new without written permission, scrape the site, or use our photography and copy without permission.',
        ],
      },
      {
        heading: 'Contact',
        body: [
          'Questions about these terms: email knocknationbag@gmail.com.',
        ],
      },
    ],
  },
}

export const policySlugs = Object.keys(policies)
