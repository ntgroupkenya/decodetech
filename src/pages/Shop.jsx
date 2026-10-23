import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SiteLink from '../components/SiteLink'
import EmptyState from '../components/EmptyState'
import { Search, X, ChevronDown, Tag, ChevronLeft, ChevronRight, BadgePercent, FileText, LayoutGrid, List } from 'lucide-react'
import { trackProductClick } from '../api'
import useOrdering from '../useOrdering'
import ShopHighlights from '../components/ShopHighlights'
import useHighlights from '../useHighlights'
import useProducts from '../useProducts'
import ShopProductCard from '../components/ShopProductCard'
import CheckoutModal from '../components/CheckoutModal'
import useAuth from '../auth/useAuth'
import useOffers from '../useOffers'
import { categoryPath, groupCategories } from '../categories'

const VIEW_KEY = 'decode-shop-view'
const COLUMN_CHOICES = [1, 2, 3, 4, 5, 6]

const GRID_ROWS_PER_PAGE = 3
const LIST_PAGE_SIZE = 8

const DEFAULT_PREFS = { view: 'grid', columns: 5 }

const selectClass =
  'h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-8 text-sm font-medium sm:pr-10 sm:text-[15px] text-gray-800 transition-colors hover:border-gray-300 focus:border-brand-charcoal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-charcoal/10 md:w-52'

// The shopper's layout choice (grid/list and products per row) is remembered on this device.
// It is read after the first render so the pre-rendered page and the browser's first render match.
function loadViewPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(VIEW_KEY) || '{}')
    return {
      view: saved.view === 'list' ? 'list' : 'grid',
      columns: COLUMN_CHOICES.includes(saved.columns) ? saved.columns : DEFAULT_PREFS.columns,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export default function Shop() {
  const allProducts = useProducts()
  const [{ view, columns }, setViewPrefs] = useState(DEFAULT_PREFS)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewPrefs(loadViewPrefs())
  }, [])
  const updateViewPrefs = (patch) => {
    const next = { view, columns, ...patch }
    setViewPrefs(next)
    setPage(1)
    try {
      localStorage.setItem(VIEW_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable (private mode): the choice just isn't remembered
    }
  }
  // Phones always show 2 columns; tablets show up to 3, and the chosen number applies on large screens.
  const gridVars = { '--m': 2, '--t': columns >= 5 ? 3 : Math.min(columns, 2), '--cols': columns }
  const { user } = useAuth()
  const offers = useOffers()
  const highlights = useHighlights()
  const { checkoutProduct, startOrder, closeCheckout, sendOrder, requestQuote } = useOrdering()
  const navigate = useNavigate()
  const [selectedBrand, setSelectedBrand] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [activeHeroSlide, setActiveHeroSlide] = useState(0)

  // Banner images live in public/brands/. Add, remove or replace slides here.
  const heroSlides = [
    { image: '/brands/hp-pavilion.jpg', alt: 'HP Pavilion laptops in blue, silver and gold' },
    { image: '/brands/apple-macbook.jpg', alt: 'Apple MacBook on a black background' },
    { image: '/brands/microsoft-surface.jpg', alt: 'Microsoft Surface laptop in black' },
    { image: '/brands/asus-rog.jpg', alt: 'ASUS ROG gaming laptop with a red glowing logo' },
  ]

  // Move to the next banner every 6 seconds; a manual change restarts the timer. Off for reduced-motion users.
  useEffect(() => {
    if (heroSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setTimeout(() => setActiveHeroSlide((slide) => (slide + 1) % heroSlides.length), 6000)
    return () => clearTimeout(timer)
  }, [activeHeroSlide, heroSlides.length])

  const products = allProducts.filter(product => product.inShop !== false)
  const categoryGroups = groupCategories(allProducts)
  const brands = ['All', ...new Set(products.map(product => product.brand))]

  const filteredProducts = products.filter(product => {
    const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBrand && matchesSearch
  })

  // Grid shows 3 rows per page (3 x the chosen products per row); the list shows 8 products per page.
  const pageSize = view === 'list' ? LIST_PAGE_SIZE : GRID_ROWS_PER_PAGE * columns
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const goToPage = (next) => {
    setPage(next)
    document.getElementById('shop-products')?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-slate-50 py-6 md:py-10" aria-label="Shop online carousel" aria-roledescription="carousel">
        <h1 className="sr-only">Shop Online</h1>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <img
            key={heroSlides[activeHeroSlide].image}
            src={heroSlides[activeHeroSlide].image}
            alt={heroSlides[activeHeroSlide].alt}
            className="mx-auto block aspect-[16/9] max-h-[480px] w-full rounded-3xl object-cover shadow-lg ring-1 ring-slate-200"
          />
          <button
            type="button"
            onClick={() => setActiveHeroSlide((slide) => (slide - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Show previous shop banner"
            className="absolute left-7 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-charcoal/80 text-white transition-colors hover:bg-brand-yellow hover:text-brand-charcoal sm:left-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => setActiveHeroSlide((slide) => (slide + 1) % heroSlides.length)}
            aria-label="Show next shop banner"
            className="absolute right-7 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-charcoal/80 text-white transition-colors hover:bg-brand-yellow hover:text-brand-charcoal sm:right-10"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="flex justify-center gap-2 py-3" aria-label="Choose shop banner">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setActiveHeroSlide(index)}
              aria-label={`Show shop banner ${index + 1}`}
              aria-current={activeHeroSlide === index ? 'true' : undefined}
              className={`h-2.5 rounded-full transition-all ${activeHeroSlide === index ? 'w-8 bg-brand-yellow' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
        <p className="sr-only">
          Browse our catalog and ask our team to confirm current pricing and availability. WhatsApp product enquiries.
        </p>
      </section>

      {/* Search and filters: one bar that stays at the top on large screens */}
      <section className="border-b border-gray-200 bg-white/95 backdrop-blur lg:sticky lg:top-20 lg:z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search products or brands..."
                aria-label="Search products or brands"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-11 text-[15px] text-gray-900 placeholder:text-gray-400 transition-colors focus:border-brand-charcoal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-charcoal/10 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex">
              {/* Choosing a category opens that category's own page (the links below do the same for search engines). */}
              <div className="relative">
                <LayoutGrid className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal" size={18} aria-hidden="true" />
                <select
                  value=""
                  onChange={(e) => e.target.value && navigate(e.target.value)}
                  aria-label="Go to a category page"
                  title="Opens the category page"
                  className={selectClass}
                >
                  <option value="">All categories</option>
                  {categoryGroups.map(group => (
                    <option key={group.slug} value={categoryPath(group.name)}>{group.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />
              </div>

              <div className="relative">
                <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal" size={18} aria-hidden="true" />
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by brand"
                  className={selectClass}
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand === 'All' ? 'All brands' : brand}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        {/* Members banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-black to-brand-charcoal px-5 py-4 text-white shadow-md sm:px-6" aria-label="Member offers">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-yellow/15" aria-hidden="true" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-black">
                <BadgePercent size={20} aria-hidden="true" />
              </span>
              {user ? (
                <p className="text-sm leading-snug sm:text-[15px]">
                  Signed in as <strong className="font-semibold text-brand-yellow">{user.name || user.username}</strong>
                  <span className="block text-white/80">
                    {offers.length > 0
                      ? `${offers.length} member offer${offers.length === 1 ? '' : 's'} available. Pick yours at checkout.`
                      : 'Member offers will appear here when available.'}
                  </span>
                </p>
              ) : (
                <p className="text-sm leading-snug sm:text-[15px]">
                  <strong className="font-semibold">Members save more</strong>
                  <span className="block text-white/80">Discounts, coupon codes and delivery offers for account holders.</span>
                </p>
              )}
            </div>
            {!user && (
              <div className="flex shrink-0 gap-2">
                <SiteLink to="/signup" state={{ from: '/shop' }} className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black transition-colors hover:bg-white">
                  Create account
                </SiteLink>
                <SiteLink to="/login" state={{ from: '/shop' }} className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  Log in
                </SiteLink>
              </div>
            )}
          </div>
        </section>

        {categoryGroups.length > 0 && (
          <nav aria-label="Shop by category">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Shop by category</h2>
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {categoryGroups.map(group => (
                <SiteLink
                  key={group.slug}
                  to={categoryPath(group.name)}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-4 pr-2 text-sm font-medium text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-charcoal hover:text-brand-charcoal hover:shadow-md"
                >
                  {group.name}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 transition-colors group-hover:bg-brand-yellow group-hover:text-brand-black">
                    {group.products.length}
                  </span>
                </SiteLink>
              ))}
            </div>
          </nav>
        )}
      </div>

      <ShopHighlights
        products={products}
        highlights={highlights}
        onOrder={startOrder}
        onOpen={(product) => trackProductClick({ productId: product.id, label: product.name })}
      />

      {/* Products Grid */}
      <section id="shop-products" className="scroll-mt-32 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-brand-charcoal">{filteredProducts.length}</span> products
              <span className="ml-3 hidden text-sm sm:inline">Confirm price and availability before visiting</span>
            </p>
            <div className="flex items-center gap-3">
              {view === 'grid' && (
                // Phones always show 2 per row, so the choice is only offered on wider screens.
                <label className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
                  <span>Per row</span>
                  <select
                    value={columns}
                    onChange={(e) => updateViewPrefs({ columns: Number(e.target.value) })}
                    title="Products per row on large screens. Phones and tablets show fewer."
                    className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                  >
                    {COLUMN_CHOICES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              )}
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 bg-white" role="group" aria-label="Product layout">
                {[{ id: 'grid', label: 'Grid', icon: LayoutGrid }, { id: 'list', label: 'List', icon: List }].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={view === id}
                    onClick={() => updateViewPrefs({ view: id })}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${view === id ? 'bg-brand-charcoal text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Icon size={16} aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={view === 'grid' ? gridVars : undefined}
            className={view === 'grid'
              ? 'grid gap-4 sm:gap-6 [grid-template-columns:repeat(var(--m),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--t),minmax(0,1fr))] lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]'
              : 'flex flex-col gap-4'}
          >
            {pageProducts.map(product => (
              <ShopProductCard
                key={product.id}
                product={product}
                offers={offers}
                view={view}
                onOrder={startOrder}
                onQuote={requestQuote}
                onOpen={(p) => trackProductClick({ productId: p.id, label: p.name })}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Product pages" className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-brand-charcoal hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <span className="text-sm text-gray-600" aria-live="polite">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-brand-charcoal hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={18} />
              </button>
            </nav>
          )}

          {products.length === 0 ? (
            <EmptyState title="No products added yet" text="The shop is being stocked. Message us on WhatsApp and we'll tell you what's available today." />
          ) : filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedBrand('All')
                  setSearchQuery('')
                  setPage(1)
                }}
                className="mt-4 text-brand-ember font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-brand-charcoal mb-12">
            How to Order
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-brand-yellow text-brand-charcoal w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-brand-charcoal mb-2">Browse & Search</h3>
              <p className="text-gray-600 text-sm">Find the right product using our filters and search</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-yellow text-brand-charcoal w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-brand-charcoal mb-2">Add to Cart</h3>
              <p className="text-gray-600 text-sm">Tap the cart icon on each product you want and set the quantities</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-yellow text-brand-charcoal w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-brand-charcoal mb-2">Send on WhatsApp</h3>
              <p className="text-gray-600 text-sm">Send your whole cart to our sales team in one ready-written message</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-yellow text-brand-charcoal w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-brand-charcoal mb-2">Complete Order</h3>
              <p className="text-gray-600 text-sm">Pay via M-Pesa/Bank & get delivery or pickup</p>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <SiteLink
              to="/how-to-order"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-charcoal px-5 py-3 font-semibold text-brand-charcoal transition-colors hover:bg-brand-charcoal hover:text-white"
            >
              <FileText size={18} aria-hidden="true" /> See the full ordering guide
            </SiteLink>
            <a href="/how-to-order.pdf" target="_blank" rel="noopener" className="text-sm text-gray-600 underline hover:text-brand-charcoal">
              or download it as a PDF
            </a>
          </div>
        </div>
      </section>

      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          offers={offers}
          onClose={closeCheckout}
          onSend={sendOrder}
        />
      )}
    </div>
  )
}
