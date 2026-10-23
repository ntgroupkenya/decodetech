import { slugify } from './productSlug.js'

// The Shop's category filter is built from the `category` field of the products.
export const categorySlug = (name) => slugify(name)

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
