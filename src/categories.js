import { slugify } from './productSlug.js'
import CATEGORY_CONTENT from './data/categoryContent.js'

// Category pages are built from the `category` field of the products. Keep the slug rule identical
// to the category entries of the sitemap in server/api.php (both use the product slug rule).
export const categorySlug = (name) => slugify(name)
export const categoryPath = (name) => `/category/${categorySlug(name)}`

// Groups active products by category: [{ slug, name, label, brands, products }], biggest first.
export function groupCategories(products) {
  const groups = new Map()
  for (const product of products) {
    if (product.active === false || !product.category) continue
    const slug = categorySlug(product.category)
    if (!slug) continue
    if (!groups.has(slug)) groups.set(slug, { slug, name: product.category, labels: new Map(), brandCounts: new Map(), products: [] })
    const group = groups.get(slug)
    group.products.push(product)
    if (product.categoryName) group.labels.set(product.categoryName, (group.labels.get(product.categoryName) || 0) + 1)
    if (product.brand && product.brand.toLowerCase() !== 'generic') group.brandCounts.set(product.brand, (group.brandCounts.get(product.brand) || 0) + 1)
  }
  const top = (map) => [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  return [...groups.values()]
    .map(({ slug, name, labels, brandCounts, products }) => ({
      slug,
      name,
      label: top(labels)[0]?.[0] || name,
      brands: top(brandCounts).map(([brand, count]) => ({ brand, count })),
      products,
    }))
    .sort((a, b) => b.products.length - a.products.length || a.name.localeCompare(b.name))
}

const clip = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`)

// Heading, intro and meta description for a category: hand-written copy when there is some,
// otherwise a generated version so every category page has real text.
export function categoryCopy(group) {
  const written = CATEGORY_CONTENT[group.slug]
  if (written) return written
  const count = group.products.length
  const brands = group.brands.slice(0, 4).map((b) => b.brand)
  const brandText = brands.length ? ` including ${brands.join(', ')}` : ''
  const heading = group.name
  return {
    heading,
    description: clip(`Browse ${count} ${group.name.toLowerCase()} product${count === 1 ? '' : 's'}${brandText} from DECODE IT Solutions. Order on WhatsApp.`, 158),
    intro: [
      `DECODE IT Solutions supplies ${group.name.toLowerCase()} to customers across Kenya. Browse the ${count} product${count === 1 ? '' : 's'} below${brandText}.`,
      'Order on WhatsApp for the current price and availability, or visit our shop.',
    ],
  }
}

// Title and description for the page's <head>.
export function categoryMeta(group, siteName = 'DECODE IT Solutions') {
  const { heading, description } = categoryCopy(group)
  return { title: `${heading} | ${siteName}`, description }
}
