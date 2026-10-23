// The Brands page, the home page and the About page build their brand lists from the products, so a brand
// added in the admin shows up everywhere on the next build. This file only adds what the products can't say:
// a logo, a short line about the brand, and optionally a lifestyle photo and a coloured logo card. Keys are lower case with spaces and dashes removed (see brandKey).
const BRAND_INFO = {
  hp: { logo: '/logos/hp.png', photo: '/brands/hp-pavilion.jpg', blurb: 'Pavilion, ProBook and EliteBook laptops, desktops and printers.' },
  lenovo: { logo: '/logos/lenovo.png', photo: '/brands/lenovo-ideapad.jpg', card: '/brands/lenovo-card.jpg', blurb: 'IdeaPad and ThinkPad laptops for study, work and business.' },
  dell: { logo: '/logos/dell.png', blurb: 'Inspiron, Latitude and Vostro laptops and desktops built for work.' },
  apple: { logo: '/logos/apple.png', photo: '/brands/apple-macbook.jpg', blurb: 'MacBook Air and MacBook Pro, plus Apple accessories.' },
  asus: { logo: '/logos/asus.png', photo: '/brands/asus-vivobook.jpg', card: '/brands/asus-card.jpg', blurb: 'VivoBook everyday laptops and ROG gaming machines.' },
  acer: { logo: '/logos/acer.png', blurb: 'Aspire and Swift laptops that give great value for money.' },
  microsoft: { logo: '/logos/microsoft.png', photo: '/brands/microsoft-surface.jpg', card: '/brands/microsoft-card.jpg', blurb: 'Surface laptops and tablets, Windows and Office.' },
  toshiba: { logo: '/logos/toshiba.png', card: '/brands/toshiba-card.jpg', blurb: 'Dependable laptops, hard drives and storage.' },
  compaq: { logo: '/logos/compaq.png', blurb: 'Affordable laptops and desktops for home and office.' },
  vention: { logo: '/logos/vention.png', photo: '/brands/vention-dock.jpg', blurb: 'Docking stations, USB-C hubs, HDMI switches and cables.' },
}

// Brands we carry that have no products online yet. They are listed as "also available to order".
const ORDER_ONLY = ['HP', 'Lenovo', 'Dell', 'Apple', 'ASUS', 'Acer', 'Microsoft', 'Toshiba', 'Compaq', 'Vention']

export const brandKey = (name) => String(name || '').toLowerCase().replace(/[\s-]+/g, '')
const isNamed = (name) => Boolean(name) && brandKey(name) !== 'generic'

// Catalogue address filtered to one brand.
export const brandProductsPath = (name) => `/products?brand=${encodeURIComponent(name)}`

// [{ name, key, logo, blurb, count, categories: [label], products }], most products first.
export function groupBrands(products) {
  const groups = new Map()
  for (const product of products) {
    if (product.active === false || !isNamed(product.brand)) continue
    const key = brandKey(product.brand)
    if (!groups.has(key)) groups.set(key, { name: product.brand, key, products: [], labels: new Map() })
    const group = groups.get(key)
    group.products.push(product)
    const label = product.categoryName || product.category
    if (label) group.labels.set(label, (group.labels.get(label) || 0) + 1)
  }
  return [...groups.values()]
    .map(({ name, key, products, labels }) => {
      const categories = [...labels.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([label]) => label)
      return {
        name,
        key,
        logo: BRAND_INFO[key]?.logo || null,
        blurb: BRAND_INFO[key]?.blurb || `${categories.join(', ')} from ${name}.`,
        count: products.length,
        categories,
        products,
      }
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

// Brands from ORDER_ONLY that still have no products in the catalogue.
export function orderOnlyBrands(brandGroups) {
  const stocked = new Set(brandGroups.map((b) => b.key))
  return ORDER_ONLY.filter((name) => !stocked.has(brandKey(name))).map((name) => ({ name, key: brandKey(name), ...BRAND_INFO[brandKey(name)] }))
}

// Brand details by name, for pages that show a brand without products (logo, blurb, photo, card).
export const brandInfo = (name) => ({ name, key: brandKey(name), ...BRAND_INFO[brandKey(name)] })
