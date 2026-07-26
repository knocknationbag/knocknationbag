/** Mock records for the dashboard UI. No business logic — presentation only. */

import { products } from '@/data/products'
import { categories } from '@/data/categories'
import { brands, collections } from '@/data/catalog'
import { policies } from '@/data/content'

export const kpis = [
  { label: 'Revenue (30d)', value: '$48,920', delta: 12.4, hint: 'vs previous 30d', icon: 'revenue' },
  { label: 'Orders (30d)', value: '327', delta: 8.1, hint: 'vs previous 30d', icon: 'orders' },
  { label: 'Avg. order value', value: '$149.60', delta: -2.3, hint: 'vs previous 30d', icon: 'aov' },
  { label: 'Conversion rate', value: '3.18%', delta: 0.4, hint: 'vs previous 30d', icon: 'conversion' },
]

export const seoKpis = [
  { label: 'Indexable pages', value: '61', hint: 'of 68 total' },
  { label: 'Missing meta description', value: '4', hint: 'needs attention' },
  { label: 'Missing alt text', value: '7', hint: 'across 3 modules' },
  { label: 'Avg. SEO score', value: '82', hint: 'target 85+' },
]

export const recentOrders = [
  { id: 'KNB-25148', customer: 'Marcus Sterling', email: 'marcus@example.com', date: '12 Feb 2025', items: 4, total: 477, status: 'Processing', payment: 'Paid' },
  { id: 'KNB-25147', customer: 'Elena Rostova', email: 'elena@example.com', date: '12 Feb 2025', items: 1, total: 299, status: 'In transit', payment: 'Paid' },
  { id: 'KNB-25146', customer: 'Devon Chen', email: 'devon@example.com', date: '11 Feb 2025', items: 2, total: 288, status: 'Delivered', payment: 'Paid' },
  { id: 'KNB-25145', customer: 'Aisha Bello', email: 'aisha@example.com', date: '11 Feb 2025', items: 1, total: 389, status: 'Delivered', payment: 'Paid' },
  { id: 'KNB-25144', customer: 'Tomás Ferreira', email: 'tomas@example.com', date: '10 Feb 2025', items: 3, total: 546, status: 'Cancelled', payment: 'Refunded' },
  { id: 'KNB-25143', customer: 'Priya Nair', email: 'priya@example.com', date: '10 Feb 2025', items: 2, total: 348, status: 'Delivered', payment: 'Paid' },
  { id: 'KNB-25142', customer: 'Jonas Weber', email: 'jonas@example.com', date: '09 Feb 2025', items: 1, total: 129, status: 'Pending', payment: 'Failed' },
]

/** Products projected into the admin list shape, with SEO completeness. */
export const adminProducts = products.map((p, i) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  image: p.image,
  imageAlt: p.imageAlt,
  brand: p.brand,
  category: p.category,
  price: p.price,
  oldPrice: p.oldPrice,
  discount: p.discount,
  stock: p.inStock ? [42, 18, 7, 3, 124][i % 5] : 0,
  // Spread across the lifecycle so the Drafts and Archived views have real content.
  status: !p.inStock ? 'Out of stock' : i % 11 === 3 ? 'Archived' : i % 9 === 0 ? 'Draft' : i % 13 === 5 ? 'Scheduled' : 'Published',
  featured: p.collections.includes('featured'),
  variants: 1 + (i % 4),
  seoScore: [92, 88, 74, 61, 96, 83, 55, 79][i % 8],
  updated: `${(i % 27) + 1} Feb 2025`,
}))

export const adminCategories = categories.map((c, i) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  image: c.image,
  products: products.filter((p) => p.category === c.slug).length,
  status: 'Published',
  seoScore: [94, 87, 72, 90, 66, 81, 78, 85][i % 8],
  updated: `${(i % 27) + 1} Feb 2025`,
}))

export const adminCollections = collections.map((c, i) => ({
  id: c.slug,
  slug: c.slug,
  title: c.title,
  products: products.filter(c.match).length,
  status: i === 3 ? 'Scheduled' : 'Published',
  seoScore: [89, 76, 93, 68][i % 4],
  updated: `${(i % 27) + 1} Feb 2025`,
}))

export const adminBrands = brands.map((b, i) => ({
  id: b.id,
  slug: b.id,
  title: b.name,
  description: b.description,
  products: products.filter((p) => p.brand === b.name).length,
  status: 'Published',
  seoScore: [84, 91, 70, 88][i % 4],
}))

export const adminCustomers = [
  { id: 'c1', name: 'Marcus Sterling', email: 'marcus@example.com', orders: 7, spent: 1842, tier: 'Nation Elite', status: 'Active', joined: 'Mar 2021' },
  { id: 'c2', name: 'Elena Rostova', email: 'elena@example.com', orders: 4, spent: 1120, tier: 'Nation', status: 'Active', joined: 'Jul 2022' },
  { id: 'c3', name: 'Devon Chen', email: 'devon@example.com', orders: 3, spent: 688, tier: 'Nation', status: 'Active', joined: 'Jan 2023' },
  { id: 'c4', name: 'Aisha Bello', email: 'aisha@example.com', orders: 2, spent: 538, tier: 'Nation', status: 'Active', joined: 'Sep 2023' },
  { id: 'c5', name: 'Tomás Ferreira', email: 'tomas@example.com', orders: 1, spent: 249, tier: 'Nation', status: 'Inactive', joined: 'Feb 2024' },
]

export const adminUsers = [
  { id: 'u1', name: 'Rafael Duarte', email: 'rafael@knocknationbag.com', role: 'super-admin', status: 'Active', lastActive: '2 minutes ago' },
  { id: 'u2', name: 'Sofia Almeida', email: 'sofia@knocknationbag.com', role: 'admin', status: 'Active', lastActive: '1 hour ago' },
  { id: 'u3', name: 'Liam Novak', email: 'liam@knocknationbag.com', role: 'seo-manager', status: 'Active', lastActive: 'Yesterday' },
  { id: 'u4', name: 'Hana Kim', email: 'hana@knocknationbag.com', role: 'content-editor', status: 'Active', lastActive: '3 days ago' },
  { id: 'u5', name: 'Owen Wright', email: 'owen@knocknationbag.com', role: 'inventory-manager', status: 'Active', lastActive: '5 days ago' },
  { id: 'u6', name: 'Mia Castro', email: 'mia@knocknationbag.com', role: 'order-manager', status: 'Inactive', lastActive: '3 weeks ago' },
  { id: 'u7', name: 'Noah Silva', email: 'noah@knocknationbag.com', role: 'support', status: 'Active', lastActive: '20 minutes ago' },
]

/** CMS pages — the live policy/content routes, editable from the dashboard. */
export const adminPages = [
  { id: 'home', slug: '', title: 'Homepage', type: 'Landing', status: 'Published', seoScore: 96, updated: '12 Feb 2025' },
  { id: 'about', slug: 'about', title: 'About Us', type: 'Standard', status: 'Published', seoScore: 88, updated: '11 Feb 2025' },
  { id: 'contact', slug: 'contact', title: 'Contact Us', type: 'Standard', status: 'Published', seoScore: 81, updated: '09 Feb 2025' },
  { id: 'faq', slug: 'faq', title: 'FAQ', type: 'FAQ', status: 'Published', seoScore: 90, updated: '08 Feb 2025' },
  ...Object.entries(policies).map(([slug, doc], i) => ({
    id: slug, slug, title: doc.title, type: 'Policy', status: 'Published',
    seoScore: [74, 69, 83, 77, 86, 72][i % 6], updated: `${(i % 27) + 1} Jan 2025`,
  })),
]

export const adminBlog = [
  { id: 'b1', slug: 'how-to-pack-a-carry-on', title: 'How to pack a carry-on for a five-day trip', author: 'Rafael Duarte', status: 'Published', seoScore: 91, updated: '10 Feb 2025' },
  { id: 'b2', slug: 'vegetable-tanned-leather-care', title: 'Caring for vegetable-tanned leather', author: 'Sofia Almeida', status: 'Published', seoScore: 86, updated: '04 Feb 2025' },
  { id: 'b3', slug: 'inside-the-lisbon-workshop', title: 'Inside the Lisbon workshop', author: 'Rafael Duarte', status: 'Draft', seoScore: 42, updated: '02 Feb 2025' },
  { id: 'b4', slug: 'why-we-repair', title: 'Why we repair instead of replace', author: 'Liam Novak', status: 'Scheduled', seoScore: 78, updated: '01 Feb 2025' },
]

/* adminMedia / mediaFolders removed — the Media Library is the single source
   of image metadata. See data/media.js and docs/admin.md. */

export const adminRedirects = [
  { id: 'r1', from: '/bags/apex-duffle', to: '/product/apex-duffle-pro', type: '301', hits: 1284, status: 'Active' },
  { id: 'r2', from: '/collections/winter-2024', to: '/collections/best-sellers', type: '301', hits: 342, status: 'Active' },
  { id: 'r3', from: '/shop/mens', to: '/category/men', type: '301', hits: 917, status: 'Active' },
  { id: 'r4', from: '/old-returns-policy', to: '/returns', type: '301', hits: 58, status: 'Active' },
  { id: 'r5', from: '/summer-sale', to: '/collections/sale', type: '302', hits: 2041, status: 'Inactive' },
]

export const adminReviews = [
  { id: 'rv1', product: 'Apex Duffle Pro', author: 'Marcus Sterling', rating: 5, status: 'Approved', date: '11 Feb 2025', excerpt: 'The architectural pockets fit everything seamlessly.' },
  { id: 'rv2', product: 'Monarch Leather Tote', author: 'Elena Rostova', rating: 5, status: 'Approved', date: '09 Feb 2025', excerpt: 'Stunning design, clean lines, remarkable durability.' },
  { id: 'rv3', product: 'Quantum Pack 15-inch', author: 'Devon Chen', rating: 4, status: 'Pending', date: '08 Feb 2025', excerpt: 'Great protection, wish the water bottle pocket were deeper.' },
  { id: 'rv4', product: 'Nova Crossbody', author: 'Anonymous', rating: 2, status: 'Rejected', date: '06 Feb 2025', excerpt: 'Chain tarnished within a month.' },
]

export const adminCoupons = [
  { id: 'cp1', code: 'NATION10', type: 'Percentage', value: '10%', uses: '482 / 1000', expires: '31 Mar 2025', status: 'Active' },
  { id: 'cp2', code: 'FREESHIP150', type: 'Free shipping', value: 'Over $150', uses: '1,204 / ∞', expires: 'No expiry', status: 'Active' },
  { id: 'cp3', code: 'WELCOME15', type: 'Percentage', value: '15%', uses: '96 / 500', expires: '30 Jun 2025', status: 'Active' },
  { id: 'cp4', code: 'BLACKFRIDAY', type: 'Percentage', value: '25%', uses: '3,417 / 3,417', expires: '02 Dec 2024', status: 'Archived' },
]

export const adminLogs = [
  { id: 'l1', actor: 'Rafael Duarte', action: 'Updated product', target: 'Apex Duffle Pro', at: '12 Feb 2025, 14:22', ip: '81.20.14.7' },
  { id: 'l2', actor: 'Liam Novak', action: 'Changed SEO title', target: 'Monarch Leather Tote', at: '12 Feb 2025, 13:04', ip: '81.20.14.9' },
  { id: 'l3', actor: 'Sofia Almeida', action: 'Published page', target: 'Shipping Policy', at: '11 Feb 2025, 17:48', ip: '81.20.14.2' },
  { id: 'l4', actor: 'Owen Wright', action: 'Adjusted stock', target: 'Helios Roll-Top (−4)', at: '11 Feb 2025, 09:12', ip: '81.20.14.5' },
  { id: 'l5', actor: 'Mia Castro', action: 'Refunded order', target: 'KNB-25144', at: '10 Feb 2025, 16:30', ip: '81.20.14.8' },
]

export const adminForms = [
  { id: 'f1', name: 'Contact enquiry', submissions: 214, unread: 6, lastEntry: '12 Feb 2025', status: 'Active' },
  { id: 'f2', name: 'Newsletter signup', submissions: 3841, unread: 0, lastEntry: '12 Feb 2025', status: 'Active' },
  { id: 'f3', name: 'Warranty claim', submissions: 37, unread: 2, lastEntry: '10 Feb 2025', status: 'Active' },
  { id: 'f4', name: 'Wholesale enquiry', submissions: 12, unread: 1, lastEntry: '04 Feb 2025', status: 'Inactive' },
]

export const adminBanners = [
  { id: 'bn1', name: 'Homepage promo — Crafted for Those Who Move', placement: 'Homepage', status: 'Published', starts: '01 Feb 2025', ends: 'No end' },
  { id: 'bn2', name: 'Free shipping strip', placement: 'Global header', status: 'Draft', starts: '—', ends: '—' },
  { id: 'bn3', name: 'Sale banner — 25% off luggage', placement: 'Category: Travel', status: 'Scheduled', starts: '01 Mar 2025', ends: '14 Mar 2025' },
]

export const inventoryRows = adminProducts.map((p) => ({
  id: p.id,
  title: p.title,
  image: p.image,
  sku: `KNB-${p.slug.slice(0, 6).toUpperCase()}`,
  stock: p.stock,
  reserved: Math.min(p.stock, (p.stock % 5) + 1),
  status: p.stock === 0 ? 'Out of stock' : p.stock <= 10 ? 'Low stock' : 'In stock',
  location: 'Lisbon workshop',
}))
