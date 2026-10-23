// URL-friendly product name. Keep identical to slugify() in server/api.php (used for the sitemap).
export function slugify(name) {
  return String(name || '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60)
    .replace(/-+$/g, '')
}

// Address of a product's own page, e.g. /product/prod-10001/example-product
export function productPath(product) {
  const slug = slugify(product.name)
  return `/product/${encodeURIComponent(product.id)}${slug ? `/${slug}` : ''}`
}

// Address of a news post, e.g. /news/3/new-stock-arrived
export function postPath(post) {
  const slug = slugify(post.title)
  return `/news/${post.id}${slug ? `/${slug}` : ''}`
}
