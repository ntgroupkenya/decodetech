// Turns a plain `vite build` into the GitHub Pages preview (https://ntgroupkenya.github.io/decodetech/).
// GitHub Pages has no PHP or database, so the preview shows the sample products from docs/decode-products.csv
// with their photos from docs/sample-products/. Logins and the admin need the real API and do not work there.
//
//   VITE_BASE=/decodetech/ vite build && node scripts/pages-demo.mjs   (npm run build:pages)
import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

const root = process.cwd()
const dist = path.join(root, 'dist')
const base = process.env.VITE_BASE || '/'

const csv = fs.readFileSync(path.join(root, 'docs', 'decode-products.csv'), 'utf8').replace(/^﻿/, '')
const yes = (value) => /^(yes|true|1)$/i.test(String(value || '').trim())
const money = (value) => (String(value || '').trim() ? Number(value) : null)
const products = Papa.parse(csv, { header: true, skipEmptyLines: true }).data.map((row) => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  category: row.category,
  categoryName: row.categoryName || row.category,
  specs: row.specs,
  // /products/x.jpg in the spreadsheet -> the copy published with the preview
  image: row.image ? `${base}sample-products/${path.basename(row.image)}` : '',
  price: money(row.price),
  oldPrice: money(row.oldPrice),
  condition: row.condition,
  freeGift: row.freeGift,
  hotFeature: row.hotFeature,
  inShop: yes(row.inShop),
  active: yes(row.active),
  hot: yes(row.hot),
}))

fs.cpSync(path.join(root, 'docs', 'sample-products'), path.join(dist, 'sample-products'), { recursive: true })

// The products travel in the page (useProducts and the highlights read window.__PRODUCTS__ when the API is missing).
const safeJson = JSON.stringify(products).replace(/</g, '\\u003c')
const html = fs
  .readFileSync(path.join(dist, 'index.html'), 'utf8')
  .replace('</head>', `    <meta name="robots" content="noindex" />\n    <script>window.__PRODUCTS__=${safeJson}</script>\n  </head>`)
fs.writeFileSync(path.join(dist, 'index.html'), html)
// GitHub Pages answers unknown addresses (a product page opened directly) with 404.html: the same app takes over.
fs.writeFileSync(path.join(dist, '404.html'), html)
fs.writeFileSync(path.join(dist, '.nojekyll'), '')
for (const file of ['sitemap.xml', '_redirects']) fs.rmSync(path.join(dist, file), { force: true })

console.log(`GitHub Pages preview ready in dist/ with ${products.length} sample products (base ${base}).`)
