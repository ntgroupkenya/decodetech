import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgePercent, ChevronLeft, ChevronRight, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import BrandStrip from '../components/BrandStrip'
import HeroBackdrop from '../components/HeroBackdrop'
import { trackProductClick } from '../api'
import useOrdering from '../useOrdering'
import ShopHighlights from '../components/ShopHighlights'
import useHighlights from '../useHighlights'
import useProducts from '../useProducts'
import ShopProductCard from '../components/ShopProductCard'
import CheckoutModal from '../components/CheckoutModal'
import useAuth from '../auth/useAuth'
import useOffers from '../useOffers'
import { categorySlug, groupCategories } from '../categories'
import { TAGLINE } from '../siteDefaults'

const VIEW_KEY = 'decode-shop-view'
const COLUMN_CHOICES = [2, 3, 4, 5]
const GRID_ROWS_PER_PAGE = 4
const LIST_PAGE_SIZE = 10
const DEFAULT_PREFS = { view: 'grid', columns: 4 }

const SORTS = [
  { id: '', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'name', label: 'Name: A to Z' },
]

const STEPS = ['Add products to your cart', 'Send one order on WhatsApp', 'Pay by M-Pesa or bank', 'Delivery or pickup']

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

const brandOf = (product) => product.brand || 'Other'
const priceOf = (product) => (product.price ? Number(product.price) : null)

// Counts of a field across products, most common first: [[value, count]].
function tally(products, pick) {
  const counts = new Map()
  for (const product of products) {
    const value = pick(product)
    if (value) counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

// A filter list: the biggest LIST_SIZE entries (and the picked one), then "Show all" for the rest, with a search box
// when the full list is long (there are about 40 categories and 50 brands).
const LIST_SIZE = 8

function FilterGroup({ title, options, active, onPick, allLabel }) {
  const [expanded, setExpanded] = useState(false)
  const [find, setFind] = useState('')
  if (options.length === 0) return null
  const needle = find.trim().toLowerCase()
  const visible = expanded
    ? options.filter(([, label]) => !needle || label.toLowerCase().includes(needle))
    : options.filter(([value], index) => index < LIST_SIZE || value === active)
  const row = (value, label, count) => (
    <li key={value || 'all'}>
      <button
        type="button"
        onClick={() => onPick(value)}
        aria-pressed={active === value}
        className={`flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${active === value ? 'bg-brand-indigo font-semibold text-white' : 'text-gray-700 hover:bg-gray-100'}`}
      >
        <span className="truncate">{label}</span>
        {count != null && <span className={`font-mono text-xs ${active === value ? 'text-brand-teal' : 'text-gray-400'}`}>{count}</span>}
      </button>
    </li>
  )
  return (
    <div>
      <h3 className="code-label mb-2">{title}</h3>
      {expanded && options.length > 15 && (
        <input
          type="search"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder={`Find a ${title.toLowerCase()}…`}
          aria-label={`Find a ${title.toLowerCase()}`}
          className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
        />
      )}
      <ul className={`space-y-0.5 ${expanded ? 'max-h-80 overflow-y-auto pr-1' : ''}`}>
        {!needle && row('', allLabel, null)}
        {visible.map(([value, label, count]) => row(value, label, count))}
        {needle && visible.length === 0 && <li className="px-2 py-1.5 text-sm text-gray-500">No match</li>}
      </ul>
      {options.length > LIST_SIZE && (
        <button
          type="button"
          onClick={() => { setExpanded(!expanded); setFind('') }}
          aria-expanded={expanded}
          className="mt-1.5 px-2 text-xs font-semibold text-brand-indigo hover:underline"
        >
          {expanded ? 'Show fewer' : `Show all ${options.length}`}
        </button>
      )}
    </div>
  )
}

export default function Shop() {
  const allProducts = useProducts()
  const [params, setParams] = useSearchParams()
  const [{ view, columns }, setViewPrefs] = useState(DEFAULT_PREFS)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewPrefs(loadViewPrefs())
  }, [])
  const { user } = useAuth()
  const offers = useOffers()
  const highlights = useHighlights()
  const { checkoutProduct, startOrder, closeCheckout, sendOrder, requestQuote } = useOrdering()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = (params.get('q') || '').trim().toLowerCase()
  const category = params.get('cat') || ''
  const brand = params.get('brand') || ''
  const condition = params.get('cond') || ''
  const sort = params.get('sort') || ''

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    // A brand chosen in one category may not exist in another.
    if (key === 'cat') next.delete('brand')
    setParams(next, { preventScrollReset: true })
  }
  const clearFilters = () => setParams(new URLSearchParams(), { preventScrollReset: true })
  // A logo in "Shop by brand" (below the products) starts a fresh search for that brand and scrolls up to the results.
  const pickBrand = ([key, value]) => {
    setParams(new URLSearchParams({ [key]: value }), { preventScrollReset: true })
    document.getElementById('shop-products')?.scrollIntoView({ behavior: 'smooth' })
  }

  const products = allProducts.filter((product) => product.inShop !== false && product.active !== false)
  const categoryGroups = groupCategories(products)
  const inCategory = category ? products.filter((p) => p.category && categorySlug(p.category) === category) : products
  const brandOptions = tally(inCategory, brandOf).map(([name, count]) => [name, name, count])
  const conditionOptions = tally(inCategory, (p) => p.condition).map(([name, count]) => [name, name, count])
  const categoryOptions = categoryGroups.map((group) => [group.slug, group.name, group.products.length])
  const activeCategory = categoryGroups.find((group) => group.slug === category)

  const filteredProducts = inCategory.filter((product) => {
    if (brand && brandOf(product) !== brand) return false
    if (condition && product.condition !== condition) return false
    if (!query) return true
    return [product.name, product.brand, product.category, product.specs].some((field) => String(field || '').toLowerCase().includes(query))
  })
  if (sort === 'name') filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
  if (sort.startsWith('price')) {
    // Products without a price go last either way.
    const dir = sort === 'price-asc' ? 1 : -1
    filteredProducts.sort((a, b) => {
      const pa = priceOf(a)
      const pb = priceOf(b)
      if (pa == null || pb == null) return (pa == null) - (pb == null)
      return (pa - pb) * dir
    })
  }

  // Page numbers start again at 1 whenever the filters or the layout change.
  const filterKey = [query, category, brand, condition, sort, view, columns].join('|')
  const [paging, setPaging] = useState({ key: filterKey, page: 1 })
  const page = paging.key === filterKey ? paging.page : 1
  const pageSize = view === 'list' ? LIST_PAGE_SIZE : GRID_ROWS_PER_PAGE * columns
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const goToPage = (next) => {
    setPaging({ key: filterKey, page: next })
    document.getElementById('shop-products')?.scrollIntoView({ block: 'start' })
  }

  const updateViewPrefs = (patch) => {
    const next = { view, columns, ...patch }
    setViewPrefs(next)
    try {
      localStorage.setItem(VIEW_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable (private mode): the choice just isn't remembered
    }
  }
  // Phones show 2 per row and tablets up to 3; the chosen number applies on large screens.
  const gridVars = { '--t': Math.min(columns, 3), '--cols': columns }

  const chips = [
    query && { key: 'q', label: `“${params.get('q').trim()}”` },
    activeCategory && { key: 'cat', label: activeCategory.name },
    brand && { key: 'brand', label: brand },
    condition && { key: 'cond', label: condition },
  ].filter(Boolean)

  const brandCount = tally(products, (p) => p.brand).length
  const stats = [
    [products.length, 'products'],
    [brandCount, 'brands'],
    [categoryGroups.length, 'categories'],
  ].filter(([n]) => n > 0)

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Category" allLabel="All categories" options={categoryOptions} active={category} onPick={(v) => setFilter('cat', v)} />
      <FilterGroup title="Brand" allLabel="All brands" options={brandOptions} active={brand} onPick={(v) => setFilter('brand', v)} />
      {conditionOptions.length > 1 && (
        <FilterGroup title="Condition" allLabel="Any condition" options={conditionOptions} active={condition} onPick={(v) => setFilter('cond', v)} />
      )}
    </div>
  )

  return (
    <div className="pb-16">
      {/* Intro panel */}
      <section className="relative overflow-hidden bg-brand-charcoal text-white">
        <HeroBackdrop />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_22rem] lg:px-8">
          <div>
            <p className="code-label !text-brand-teal">decode shop</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{TAGLINE}.</h1>
            <p className="mt-3 max-w-xl text-white/75">
              Laptops, desktops and accessories from DECODE IT Solutions in Nairobi. Fill your cart and send us one order on WhatsApp. We confirm the price and stock with you.
            </p>
            {stats.length > 0 && (
              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                {stats.map(([n, label]) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-mono text-sm text-white/70"><span className="text-2xl font-bold text-white">{n}</span> {label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="self-start rounded-md border border-white/15 bg-brand-charcoal/70 p-5 backdrop-blur-sm" aria-label="Member offers">
            <div className="flex items-center gap-2 text-brand-teal">
              <BadgePercent size={18} aria-hidden="true" />
              <p className="font-mono text-xs font-bold uppercase tracking-wide">Members save more</p>
            </div>
            {user ? (
              <p className="mt-2 text-sm text-white/85">
                Signed in as <strong className="text-white">{user.name || user.username}</strong>.{' '}
                {offers.length > 0
                  ? `${offers.length} member offer${offers.length === 1 ? '' : 's'} ready for you. Pick yours in the cart.`
                  : 'Member offers appear here when available.'}
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-white/85">Discounts, coupon codes and delivery offers for account holders.</p>
                <div className="mt-4 flex gap-2">
                  <Link to="/signup" state={{ from: '/' }} className="flex-1 rounded-md bg-brand-teal px-3 py-2 text-center text-sm font-semibold text-brand-ink hover:bg-brand-teal-light">Create account</Link>
                  <Link to="/login" state={{ from: '/' }} className="flex-1 rounded-md border border-white/30 px-3 py-2 text-center text-sm font-semibold hover:bg-white/10">Log in</Link>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <ol className="no-scrollbar mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8" aria-label="How ordering works">
            {STEPS.map((step, index) => (
              <li key={step} className="flex shrink-0 items-center gap-2 text-sm text-white/80">
                <span className="font-mono text-xs font-bold text-brand-teal">0{index + 1}</span> {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        <ShopHighlights
          products={products}
          highlights={highlights}
          offers={offers}
          onOrder={startOrder}
          onOpen={(product) => trackProductClick({ productId: product.id, label: product.name })}
        />

        <div id="shop-products" className="scroll-mt-40 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-6">
          {/* Filters: a column on large screens, a drawer on phones and tablets */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-40 rounded-md border border-gray-200 bg-white p-4">{filters}</div>
          </aside>
          {filtersOpen && (
            <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
              <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <p className="font-heading text-lg font-bold text-brand-charcoal">Filters</p>
                  <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="rounded-md p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">{filters}</div>
                <div className="border-t border-gray-200 p-4">
                  <button type="button" onClick={() => setFiltersOpen(false)} className="w-full rounded-md bg-brand-indigo py-3 font-semibold text-white">
                    Show {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2.5">
              <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden">
                <SlidersHorizontal size={16} aria-hidden="true" /> Filters
              </button>
              <p className="text-sm text-gray-600">
                <span className="font-mono font-bold text-brand-charcoal">{filteredProducts.length}</span> result{filteredProducts.length === 1 ? '' : 's'}
              </p>
              <div className="ml-auto flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="hidden sm:inline">Sort</span>
                  <select value={sort} onChange={(e) => setFilter('sort', e.target.value)} className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40">
                    {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                {view === 'grid' && (
                  // Phones always show 2 per row, so the choice is only offered on large screens.
                  <label className="hidden items-center gap-2 text-sm text-gray-600 lg:flex">
                    <span>Per row</span>
                    <select
                      value={columns}
                      onChange={(e) => updateViewPrefs({ columns: Number(e.target.value) })}
                      title="Products per row on large screens. Phones and tablets show fewer."
                      className="rounded-md border border-gray-300 bg-white px-2 py-1.5 font-mono text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                    >
                      {COLUMN_CHOICES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                )}
                <div className="inline-flex overflow-hidden rounded-md border border-gray-300" role="group" aria-label="Product layout">
                  {[{ id: 'grid', label: 'Grid', icon: LayoutGrid }, { id: 'list', label: 'List', icon: List }].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={view === id}
                      aria-label={`${label} layout`}
                      title={label}
                      onClick={() => updateViewPrefs({ view: id })}
                      className={`px-2.5 py-1.5 transition-colors ${view === id ? 'bg-brand-indigo text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
              {chips.length > 0 && (
                <div className="flex w-full flex-wrap items-center gap-2 border-t border-gray-100 pt-2.5">
                  {chips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => setFilter(chip.key, '')}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-brand-teal/15 px-2 py-1 text-xs font-medium text-brand-charcoal hover:bg-brand-teal/30"
                      aria-label={`Remove filter ${chip.label}`}
                    >
                      {chip.label} <X size={12} aria-hidden="true" />
                    </button>
                  ))}
                  <button type="button" onClick={clearFilters} className="text-xs font-medium text-brand-red hover:underline">Clear all</button>
                </div>
              )}
            </div>

            {pageProducts.length > 0 && (
              <div
                style={view === 'grid' ? gridVars : undefined}
                className={view === 'grid'
                  ? 'grid grid-cols-2 gap-3 sm:[grid-template-columns:repeat(var(--t),minmax(0,1fr))] lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]'
                  : 'flex flex-col gap-3'}
              >
                {pageProducts.map((product) => (
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
            )}

            {totalPages > 1 && (
              <nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="rounded-md border border-gray-300 bg-white p-2 text-brand-charcoal hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                  .map((n, i, shown) => (
                    <span key={n} className="flex items-center gap-1">
                      {i > 0 && n - shown[i - 1] > 1 && <span className="px-1 font-mono text-gray-400">…</span>}
                      <button
                        type="button"
                        onClick={() => goToPage(n)}
                        aria-current={n === currentPage ? 'page' : undefined}
                        className={`min-w-9 rounded-md border px-2 py-1.5 font-mono text-sm ${n === currentPage ? 'border-brand-indigo bg-brand-indigo text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="rounded-md border border-gray-300 bg-white p-2 text-brand-charcoal hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}

            {products.length === 0 ? (
              <EmptyState title="No products added yet" text="The shop is being stocked. Message us on WhatsApp and we'll tell you what's available today." />
            ) : filteredProducts.length === 0 && (
              <EmptyState title="Nothing matches these filters" text="Try another search word, or clear the filters to see everything.">
                <button type="button" onClick={clearFilters} className="rounded-md bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-dark">
                  Clear all filters
                </button>
              </EmptyState>
            )}
          </div>
        </div>

        <BrandStrip products={products} active={brand ? ['brand', brand] : ['q', query]} onPick={pickBrand} />
      </div>

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
