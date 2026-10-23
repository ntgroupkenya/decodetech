// Title and description for each public route. Edit the wording here.
import { MAIN_URL, SHOP_URL, isShopPath } from './siteHosts.js'
import { SITE_NAME as SITE, TAGLINE } from './siteDefaults.js'

// Public address of the main site, used for canonical links (see siteHosts.js to change it).
export const SITE_URL = MAIN_URL

// Canonical address for a route: '/' stays '/', everything else has no trailing slash.
// The Shop lives on its own address, so its canonical link is the shop subdomain's home page.
export function canonicalUrl(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (isShopPath(path)) return `${SHOP_URL}${path === '/shop' ? '/' : path}`
  return `${MAIN_URL}${path === '/' ? '/' : path}`
}

export const PAGE_META = {
  '/': {
    title: `${SITE} | ${TAGLINE}`,
    description:
      'Computer sales and repairs, accessories, websites and point-of-sale systems in Nairobi. Visit us at Ridge House off Accra Road, or chat with us on WhatsApp.',
  },
  '/about': {
    title: `About Us | ${SITE}`,
    description:
      'DECODE IT Solutions is a Nairobi IT shop for computer sales and repairs, accessories, websites and POS systems, with support that lasts beyond the sale.',
  },
  '/brands': {
    title: `Brands We Stock | ${SITE}`,
    description:
      'The brands we stock and supply.',
  },
  '/products': {
    title: `Product Catalogue | ${SITE}`,
    description:
      'Browse our full product range. Ask for prices and availability on WhatsApp.',
  },
  '/shop': {
    title: `Shop Online | Order on WhatsApp | ${SITE}`,
    description:
      'Shop online: see hot products and best sellers, unlock member discounts, coupons and delivery offers, then order on WhatsApp.',
  },
  '/how-to-order': {
    title: `How to Order Online | ${SITE}`,
    description:
      'Order online in 5 steps: add products to your cart, send one WhatsApp order, pay by M-Pesa or bank, then get delivery or pickup.',
  },
  '/news': {
    title: `News & Updates | ${SITE}`,
    description:
      'New stock, offers, buying tips and announcements from DECODE IT Solutions.',
  },
  '/contact': {
    title: `Contact Us | ${SITE}`,
    description:
      'Visit us at Ridge House off Accra Road, call +254 711 294124, or message us on WhatsApp for quotes, repairs and advice.',
  },
  '/login': {
    title: `Log In | ${SITE}`,
    description: 'Log in to your DECODE IT Solutions account to see member discounts, coupons and delivery offers.',
    noindex: true,
  },
  '/signup': {
    title: `Create an Account | ${SITE}`,
    description: 'Create a free DECODE IT Solutions account to unlock member discounts, coupons and delivery offers.',
    noindex: true,
  },
}

function setMeta(selector, attribute, key, content) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export function applyPageMeta({ title, description, noindex = false, path }) {
  document.title = title
  if (path) {
    const url = canonicalUrl(path)
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', url)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
  }
  if (description) {
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  }
  setMeta('meta[property="og:title"]', 'property', 'og:title', title)
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)

  const robots = document.head.querySelector('meta[name="robots"]')
  if (noindex) setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow')
  else robots?.remove()
}

const clip = (text, max) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

// Title and description for one product's page.
export function productMeta(product) {
  const brand = product.brand && product.brand.toLowerCase() !== 'generic' ? ` | ${product.brand}` : ''
  const title = `${clip(product.name, 42)}${brand} | ${SITE}`
  const specs = product.specs ? `${String(product.specs).replace(/\.+$/, '')}. ` : ''
  const price = product.price ? `KES ${Number(product.price).toLocaleString('en-KE')}. ` : ''
  const description = clip(`${product.name}: ${specs}${price}Order or ask for a quote on WhatsApp from ${SITE}.`, 158)
  return { title, description }
}

// Title and description for one news post's page.
export function postMeta(post) {
  const title = `${clip(post.title, 52)} | News | ${SITE}`
  const description = clip(post.summary || post.body || post.title, 158)
  return { title, description }
}
