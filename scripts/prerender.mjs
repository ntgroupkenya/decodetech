// Build step: turns each public page, plus one page per category and per product, into real HTML so search engines
// (and link previews) see the content, title, description and canonical link without running JavaScript.
// It also writes sitemap.xml from the same product list.
//
//   vite build                                         -> dist/
//   vite build --ssr src/entry-server.jsx --outDir dist-ssr
//   node scripts/prerender.mjs [--dist dist] [--ssr dist-ssr] [--api http://localhost:8080]
//
// Products are read from the PHP API (start MySQL and `npm run api` first). If it cannot be reached
// the catalogue bundled with the site (src/data/newProducts.js) is used instead.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PAGE_META, SITE_URL, canonicalUrl, postMeta, productMeta } from '../src/pageMeta.js'
import { postPath, productPath } from '../src/productSlug.js'
import { DEFAULT_SETTINGS, digitsOnly } from '../src/siteDefaults.js'
import { categoryMeta, categoryPath, groupCategories } from '../src/categories.js'
import bundledProducts from '../src/data/newProducts.js'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const distDir = path.resolve(arg('dist', 'dist'))
const ssrDir = path.resolve(arg('ssr', 'dist-ssr'))
const apiBase = (arg('api', process.env.PRERENDER_API || 'http://localhost:8080')).replace(/\/$/, '')

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function loadProducts() {
  try {
    const res = await fetch(`${apiBase}/api/products`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data.products) || data.products.length === 0) throw new Error('the database has no products yet')
    return { products: data.products.filter((p) => p.active !== false), source: `database via ${apiBase}` }
  } catch (error) {
    console.warn(`! Could not read products from ${apiBase} (${error.message}). Using the bundled catalogue.`)
    return { products: bundledProducts, source: 'bundled catalogue' }
  }
}

// The owner-edited website details and published news posts, from the same API (defaults if it is unreachable).
async function loadFromApi(path, pick, fallback) {
  try {
    const res = await fetch(`${apiBase}/api${path}`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return pick(await res.json()) ?? fallback
  } catch (error) {
    console.warn(`! Could not read ${path} from ${apiBase} (${error.message}). Using the defaults.`)
    return fallback
  }
}
const settings = await loadFromApi('/settings', (d) => (d && d.contact ? d : null), DEFAULT_SETTINGS)
const posts = await loadFromApi('/posts', (d) => (Array.isArray(d.posts) ? d.posts : null), [])
const site = { settings, posts }

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html is already pre-rendered. Run a fresh `vite build` first.')
}
const { products, source } = await loadProducts()

// Pages that are not pre-rendered (login, sign up, admin) are served this empty shell instead.
fs.writeFileSync(path.join(distDir, 'app-shell.html'), template)

// The catalogue travels with every page so the browser's first render matches the pre-rendered HTML.
const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
const productsScript = `<script>window.__PRODUCTS__=${safeJson(products)};window.__SETTINGS__=${safeJson(settings)};window.__POSTS__=${safeJson(posts)}</script>`

// The business's structured data lives in index.html with the default WhatsApp (sales) and office numbers, email
// and social profiles; keep it in step with what the owner has set in Admin → Settings.
const e164 = (value) => `+${digitsOnly(value).replace(/^0/, '254')}`
// Real profile addresses only: a bare https://x.com/ placeholder is not the business's profile.
const profiles = (settings.social || []).map((s) => String(s.url || '')).filter((url) => /^https:\/\/[^/]+\/.+/.test(url))
const swapDetails = (html) => {
  const swaps = [
    [e164(DEFAULT_SETTINGS.contact.whatsapp), settings.contact.whatsapp && e164(settings.contact.whatsapp)],
    [e164(DEFAULT_SETTINGS.contact.officePhone), settings.contact.officePhone && e164(settings.contact.officePhone)],
    [DEFAULT_SETTINGS.contact.email, settings.contact.email],
  ]
  for (const [from, to] of swaps) if (to && from !== to) html = html.split(`"${from}"`).join(`"${to}"`)
  if (profiles.length) html = html.replace(/"sameAs": \[[^\]]*\]/, () => `"sameAs": ${JSON.stringify(profiles)}`)
  return html
}

function setTag(html, selector, tag) {
  // Replace the existing tag, or add it to <head> when the template does not have one.
  return selector.test(html) ? html.replace(selector, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function buildPage(route, meta, image) {
  const url = canonicalUrl(route)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  let html = template.replace('<div id="root"></div>', `<div id="root" data-route="${route}">${render(route, products, site)}</div>`)
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`)
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`)
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
  if (image) {
    html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}" />`)
    html = setTag(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
  }
  html = swapDetails(html)
  return html.replace('</head>', `    ${productsScript}\n  </head>`)
}

const write = (route, html) => {
  const file = route === '/' ? path.join(distDir, 'index.html') : path.join(distDir, decodeURIComponent(route.slice(1)), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

// ---- site pages ----
let pageCount = 0
for (const [route, meta] of Object.entries(PAGE_META)) {
  if (meta.noindex) continue
  write(route, buildPage(route, meta))
  pageCount++
}

// ---- one page per product ----
let productCount = 0
const productEntries = []
for (const product of products) {
  const route = productPath(product)
  // The product's photo is its share image (used by WhatsApp, Facebook and X link previews). Both the bundled
  // photos and admin uploads are served from the website's own address on the web host.
  const image = product.image && product.image.startsWith('/') ? `${SITE_URL}${product.image}` : undefined
  write(route, buildPage(route, productMeta(product), image))
  productEntries.push({ route, updatedAt: product.updatedAt })
  productCount++
}

// ---- one page per news post ----
const postEntries = []
for (const post of posts) {
  const route = postPath(post)
  const image = post.image && post.image.startsWith('/') ? `${SITE_URL}${post.image}` : undefined
  write(route, buildPage(route, postMeta(post), image))
  postEntries.push({ route, updatedAt: post.updatedAt })
}

// ---- one page per category ----
let categoryCount = 0
const categoryEntries = []
for (const group of groupCategories(products)) {
  const route = categoryPath(group.name)
  write(route, buildPage(route, categoryMeta(group)))
  const newest = group.products.map((p) => p.updatedAt).filter(Boolean).sort().pop()
  categoryEntries.push({ route, updatedAt: newest })
  categoryCount++
}

// ---- sitemap.xml (same rules as GET /api/sitemap in server/api.php) ----
const today = new Date().toISOString().slice(0, 10)
const urlEntry = (route, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${escapeHtml(canonicalUrl(route))}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`
// The Shop is on its own address (shop subdomain), so it has its own sitemap below.
const sitePages = [['/', 'weekly', '1.0'], ['/products', 'weekly', '0.9'], ['/brands', 'monthly', '0.7'], ['/about', 'monthly', '0.6'], ['/how-to-order', 'monthly', '0.6'], ['/news', 'weekly', '0.6'], ['/contact', 'monthly', '0.8']]
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitePages.map(([route, freq, prio]) => urlEntry(route, today, freq, prio)).join('') +
  categoryEntries.map(({ route, updatedAt }) => urlEntry(route, updatedAt ? String(updatedAt).slice(0, 10) : today, 'weekly', '0.8')).join('') +
  productEntries.map(({ route, updatedAt }) => urlEntry(route, updatedAt ? String(updatedAt).slice(0, 10) : today, 'weekly', '0.8')).join('') +
  postEntries.map(({ route, updatedAt }) => urlEntry(route, updatedAt ? String(updatedAt).slice(0, 10) : today, 'monthly', '0.6')).join('') +
  `</urlset>\n`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)

// sitemap-shop.xml: served on the shop subdomain, where a sitemap may only list that host's own addresses.
const shopSitemap =
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` +
  urlEntry('/shop', today, 'daily', '1.0') +
  `</urlset>
`
fs.writeFileSync(path.join(distDir, 'sitemap-shop.xml'), shopSitemap)

console.log(`Pre-rendered ${pageCount} pages, ${categoryCount} category pages, ${productCount} product pages and ${postEntries.length} news posts (products from the ${source}).`)
console.log(`Wrote sitemap.xml with ${pageCount - 1 + categoryCount + productCount + postEntries.length} URLs and sitemap-shop.xml with the shop address.`)
