// Title and description for each public route. Edit the wording here.
import { SITE_URL } from './siteHosts.js'
import { SITE_NAME as SITE, TAGLINE } from './siteDefaults.js'

export { SITE_URL }

// Canonical address for a route: '/' stays '/', everything else has no trailing slash.
export function canonicalUrl(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return `${SITE_URL}${path}`
}

export const PAGE_META = {
  '/': {
    title: `${SITE} Shop | ${TAGLINE}`,
    description:
      'Laptops, desktops and computer accessories in Nairobi. Add products to your cart, unlock member offers and send one order on WhatsApp.',
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
