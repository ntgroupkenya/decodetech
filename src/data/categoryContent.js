// Hand-written copy for category pages, keyed by the category's slug (its name lowercased with dashes:
// "Water Pumps" -> "water-pumps"). Categories without an entry here get a sensible generated heading
// and intro (see categoryCopy in src/categories.js), so a new category in the admin works straight away.
//
// heading      the page's H1
// description  meta description (about 150 characters)
// intro        paragraphs shown above the products
//
// Example:
//   'example-category': {
//     heading: 'Example Category',
//     description: 'One or two sentences for search results.',
//     intro: ['First paragraph shown above the products.', 'Second paragraph.'],
//   },
const CATEGORY_CONTENT = {}

export default CATEGORY_CONTENT
