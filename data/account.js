/** Dummy account data for the static account UI. No auth, no persistence. */

export const customer = {
  name: 'Marcus Sterling',
  email: 'marcus.sterling@example.com',
  memberSince: 'March 2021',
  tier: 'Nation Elite',
}

export const orders = [
  {
    id: 'KNB-24817',
    date: '18 January 2025',
    status: 'Delivered',
    total: 468,
    items: [
      { slug: 'apex-duffle-pro', title: 'Apex Duffle Pro', qty: 1, price: 249, image: '/images/products/apex-duffle-pro.webp' },
      { slug: 'nomad-tech-folio', title: 'Nomad Tech Folio', qty: 1, price: 99, image: '/images/products/nomad-tech-folio.webp' },
      { slug: 'vector-laptop-sleeve', title: 'Vector Laptop Sleeve', qty: 1, price: 79, image: '/images/products/nomad-tech-folio.webp' },
    ],
  },
  {
    id: 'KNB-24390',
    date: '02 December 2024',
    status: 'Delivered',
    total: 219,
    items: [
      { slug: 'executive-messenger', title: 'Executive Messenger', qty: 1, price: 219, image: '/images/products/executive-messenger.webp' },
    ],
  },
  {
    id: 'KNB-25022',
    date: '04 February 2025',
    status: 'In transit',
    total: 349,
    items: [
      { slug: 'atlas-shell-roller', title: 'Atlas Shell Roller', qty: 1, price: 349, image: '/images/products/atlas-shell-roller.webp' },
    ],
  },
]

export const addresses = [
  {
    id: 'home',
    label: 'Home',
    isDefault: true,
    name: 'Marcus Sterling',
    lines: ['412 Bleecker Street', 'Apartment 6B', 'New York, NY 10014'],
    country: 'United States',
    phone: '+1 (555) 018 4420',
  },
  {
    id: 'office',
    label: 'Office',
    isDefault: false,
    name: 'Marcus Sterling',
    lines: ['Sterling & Co.', '88 Wall Street, Floor 14', 'New York, NY 10005'],
    country: 'United States',
    phone: '+1 (555) 018 7781',
  },
]

/** Cart contents for the static cart and checkout UI. */
export const cartItems = [
  {
    slug: 'apex-duffle-pro',
    title: 'Apex Duffle Pro',
    price: 249,
    oldPrice: 299,
    qty: 1,
    color: 'Graphite',
    image: '/images/products/apex-duffle-pro.webp',
    imageAlt: 'Apex Duffle Pro dark leather weekend duffle on a stone plinth',
  },
  {
    slug: 'nova-crossbody',
    title: 'Nova Crossbody',
    price: 129,
    oldPrice: 159,
    qty: 2,
    color: 'Black',
    image: '/images/products/nova-crossbody.webp',
    imageAlt: 'Nova Crossbody black quilted bag with a gold chain strap',
  },
  {
    slug: 'nomad-tech-folio',
    title: 'Nomad Tech Folio',
    price: 99,
    oldPrice: 129,
    qty: 1,
    color: 'Charcoal',
    image: '/images/products/nomad-tech-folio.webp',
    imageAlt: 'Nomad Tech Folio open cable organiser on a white desk',
  },
]

export const wishlistSlugs = [
  'atlas-shell-roller',
  'monarch-leather-tote',
  'helios-roll-top',
  'crimson-top-handle',
]

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard', detail: '3–5 working days', price: 0 },
  { id: 'express', label: 'Express', detail: 'Next working day', price: 18 },
  { id: 'intl', label: 'International', detail: '7–12 working days', price: 32 },
]
