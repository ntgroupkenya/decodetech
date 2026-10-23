import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react'
import { brandKey } from '../brands'
import SiteLink from '../components/SiteLink'
import EmptyState from '../components/EmptyState'
import { useSiteSettings } from '../siteSettings'
import { productPath } from '../productSlug'
import useProducts from '../useProducts'
import ProductImage from '../components/ProductImage'
import { categoryPath, groupCategories } from '../categories'
import PageHeader from '../components/PageHeader'

const BIG_TILES = 3
const MEDIUM_TILES = 4
// Grid cells: 3 columns on phones, 6 from tablet up. Big tiles fill 3x3 cells (the full phone width), medium 2x2, small 1x1.
const TILE_CLASS = {
  big: 'col-span-3 row-span-3',
  medium: 'col-span-2 row-span-2',
  small: 'col-span-1 row-span-1',
}

// Seeded shuffle (mulberry32 + Fisher-Yates) so the order stays steady while the page is open.
function shuffle(items, seed) {
  let a = seed >>> 0
  const random = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function Products() {
  const allProducts = useProducts()
  const { whatsappUrl } = useSiteSettings()
  const [currentPage, setCurrentPage] = useState(1)

  // Every category has its own page; the filter row below links to them.
  const catalogProducts = allProducts.filter(product => product.inCatalog !== false)
  const categoryGroups = groupCategories(catalogProducts)

  // Search and brand filters narrow the whole catalogue; changing either returns to page 1.
  const [brand, setBrand] = useState('All')
  const [query, setQuery] = useState('')
  const brandOptions = [...new Set(catalogProducts.map(product => product.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  const searchText = query.trim().toLowerCase()
  const filteredProducts = catalogProducts.filter(product =>
    (brand === 'All' || brandKey(product.brand) === brandKey(brand)) &&
    (!searchText ||
      product.name.toLowerCase().includes(searchText) ||
      (product.brand || '').toLowerCase().includes(searchText) ||
      (product.specs || '').toLowerCase().includes(searchText))
  )
  const clearFilters = () => {
    setBrand('All')
    setQuery('')
    setCurrentPage(1)
  }
  // The Brands page links here as /products?brand=<name>. Applied after the first render, like the shuffle below,
  // so the pre-rendered HTML (built without the query) still matches.
  const [searchParams] = useSearchParams()
  const brandParam = searchParams.get('brand')
  useEffect(() => {
    if (!brandParam) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrand(brandParam)
    setCurrentPage(1)
  }, [brandParam])
  // The catalogue is shuffled on every page load (after the first render, so the pre-rendered HTML still matches),
  // and each page then shows 3 big, 4 medium and the rest small tiles, with the sizes placed at random.
  const [seed, setSeed] = useState(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(Math.floor(Math.random() * 2 ** 32))
  }, [])
  const shuffledProducts = seed === null ? filteredProducts : shuffle(filteredProducts, seed)
  const pageSize = 24
  const totalPages = Math.ceil(shuffledProducts.length / pageSize)
  const pageProducts = shuffledProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const tiers = (() => {
    const big = Math.min(BIG_TILES, pageProducts.length)
    const medium = Math.min(MEDIUM_TILES, pageProducts.length - big)
    const list = [...Array(big).fill('big'), ...Array(medium).fill('medium'), ...Array(pageProducts.length - big - medium).fill('small')]
    return seed === null ? list : shuffle(list, seed + currentPage)
  })()
  const firstProduct = filteredProducts.length ? (currentPage - 1) * pageSize + 1 : 0
  const lastProduct = Math.min(currentPage * pageSize, filteredProducts.length)
  const renderGalleryTile = (product, tier) => (
    <article
      key={product.id}
      className={`relative overflow-hidden rounded-xl bg-brand-charcoal shadow-md ${TILE_CLASS[tier]}`}
    >
      <ProductImage src={product.image} alt={product.name} className="absolute inset-0 !aspect-auto h-full" />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-left ${tier === 'small' ? 'px-2 pb-2 pt-6' : 'px-4 pb-4 pt-12'}`}>
        {tier !== 'small' && (
          <p className="mb-1 text-xs uppercase tracking-wide text-white/75">
            {product.brand}{product.condition && ` · ${product.condition}`} · {product.categoryName}
          </p>
        )}
        <h2 className={tier === 'small' ? 'line-clamp-2 text-[11px] font-semibold leading-tight text-white sm:text-xs' : tier === 'medium' ? 'text-sm font-semibold text-white sm:text-base' : 'text-base font-semibold text-white sm:text-xl'}>
          <SiteLink to={productPath(product)} className="pointer-events-auto hover:underline">{product.name}</SiteLink>
        </h2>
      </div>
    </article>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader eyebrow="Catalogue" title="Our" accent="products" intro="Browse the full range, then ask for prices and availability on WhatsApp." />

      <section className="bg-white border-b border-gray-200 lg:sticky lg:top-20 lg:z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <span className="text-gray-600 font-medium">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                aria-current="page"
                className="px-4 py-2 rounded-lg font-medium bg-brand-yellow text-brand-charcoal"
              >
                All Products
              </span>
              {categoryGroups.map(group => (
                <SiteLink
                  key={group.slug}
                  to={categoryPath(group.name)}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {group.name}
                </SiteLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search products or brands..."
                aria-label="Search the catalogue"
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filter by brand"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="All">All brands</option>
              {brandOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600" aria-live="polite">
              {filteredProducts.length === 0
                ? (allProducts.length === 0 ? 'No products added yet' : 'No products found')
                : filteredProducts.length === 1
                  ? 'Showing 1 product'
                  : `Showing ${firstProduct}–${lastProduct} of ${filteredProducts.length} products`}
            </p>
          </div>

          {allProducts.length === 0 ? (
            <EmptyState title="No products added yet" text="Our catalogue is being stocked. Message us on WhatsApp for current availability and prices." />
          ) : filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-500">No products match your search.</p>
              <button type="button" onClick={clearFilters} className="mt-3 font-semibold text-brand-charcoal underline">Clear filters</button>
            </div>
          )}

          {pageProducts.length > 0 && (
            // The wrapper is a size container so the grid rows can be exactly one column wide (square cells).
            <div className="[container-type:inline-size]">
              <div
                className="grid grid-flow-dense grid-cols-3 gap-3 auto-rows-[calc((100cqw-1.5rem)/3)] md:grid-cols-6 md:gap-4 md:auto-rows-[calc((100cqw-5rem)/6)]"
                aria-label="Product gallery"
              >
                {pageProducts.map((product, index) => renderGalleryTile(product, tiers[index]))}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Product pages" className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-brand-charcoal disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <span className="text-sm text-gray-600" aria-live="polite">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-brand-charcoal disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-charcoal mb-4">Not sure what fits your setup?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Tell us how you will use it and our team will recommend the right product and confirm availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={whatsappUrl} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center space-x-2">
              <span>💬</span><span>Chat on WhatsApp</span>
            </a>
            <a href="/contact" className="bg-brand-yellow text-brand-charcoal px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-orange transition-colors inline-flex items-center justify-center">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
