// A laptop added without a photo shows a photo of its brand (public/placeholders/laptop-<brand>.jpg) instead of an
// empty box, marked "Sample image" so shoppers know it is not the exact unit. Add a brand by adding its file here.
// Search engines and link previews only ever get real product photos (see ProductPage and prerender.mjs).
const LAPTOP_PLACEHOLDERS = ['hp', 'lenovo', 'dell', 'apple', 'asus', 'microsoft', 'toshiba']

const brandKey = (name) => String(name || '').toLowerCase().replace(/[\s-]+/g, '')
const isLaptop = (product) => /laptop|notebook|macbook/i.test(`${product.category || ''} ${product.categoryName || ''} ${product.name || ''}`)

export function placeholderPhoto(product) {
  const key = brandKey(product.brand)
  if (!isLaptop(product) || !LAPTOP_PLACEHOLDERS.includes(key)) return null
  return `${import.meta.env.BASE_URL}placeholders/laptop-${key}.jpg`
}

// { images, sample }: the product's own photos, or its brand's sample photo when it has none.
export function productPhotos(product) {
  const own = [product.image, ...(product.alternateImages || [])].filter(Boolean)
  if (own.length > 0) return { images: own, sample: false }
  const placeholder = placeholderPhoto(product)
  return placeholder ? { images: [placeholder], sample: true } : { images: [], sample: false }
}
