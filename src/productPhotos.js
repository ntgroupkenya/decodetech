// A laptop added without a photo shows a drawn laptop with its brand name (components/LaptopPlaceholder.jsx)
// instead of an empty box. Search engines and link previews only ever get real product photos.
const isLaptop = (product) => /laptop|notebook|macbook/i.test(`${product.category || ''} ${product.categoryName || ''} ${product.name || ''}`)

// { images, placeholderBrand }: the product's own photos, or the brand to draw when a laptop has none.
export function productPhotos(product) {
  const own = [product.image, ...(product.alternateImages || [])].filter(Boolean)
  if (own.length > 0 || !isLaptop(product)) return { images: own, placeholderBrand: null }
  return { images: [], placeholderBrand: product.brand || 'Laptop' }
}
