import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import SiteLink from '../components/SiteLink'
import { ChevronRight, Search } from 'lucide-react'
import { trackProductClick } from '../api'
import { categoryCopy, categoryMeta, categoryPath, groupCategories } from '../categories'
import { canonicalUrl, applyPageMeta } from '../pageMeta'
import { productPath } from '../productSlug'
import useProducts from '../useProducts'
import useOffers from '../useOffers'
import useOrdering from '../useOrdering'
import CheckoutModal from '../components/CheckoutModal'
import ShopProductCard from '../components/ShopProductCard'

const faqFor = (name) => [
  {
    q: `Can I buy ${name.toLowerCase()} from DECODE IT Solutions online?`,
    a: 'Yes. Open any product, press Order via WhatsApp and our team will confirm the price and availability with you. You can pay by M-Pesa or bank transfer, then arrange delivery or pick up from our shop.',
  },
  {
    q: `How much do ${name.toLowerCase()} cost?`,
    a: 'Prices depend on the model and what we have in stock. Press Order or Get Expert Quote on any product and we will confirm the current price on WhatsApp. Signed-in members also get access to discounts, coupons and delivery offers.',
  },
  {
    q: 'Where can I see the products in person?',
    a: 'Visit our shop, open Monday to Saturday, 8:00 AM to 6:00 PM. See the Contact page for directions.',
  },
]

// Structured data: the collection, its breadcrumb trail, the products listed and the FAQ shown on the page.
function categoryJsonLd(group, copy, faq) {
  const url = canonicalUrl(categoryPath(group.name))
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: copy.heading, url, description: copy.description },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: canonicalUrl('/shop') },
          { '@type': 'ListItem', position: 3, name: group.name, item: url },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: group.products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: canonicalUrl(productPath(product)),
          name: product.name,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  }
  // "<" is escaped so the JSON can never close the surrounding script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function CategoryPage() {
  const { slug } = useParams()
  const products = useProducts()
  const offers = useOffers()
  const { checkoutProduct, startOrder, closeCheckout, sendOrder, requestQuote } = useOrdering()

  const groups = useMemo(() => groupCategories(products), [products])
  const group = groups.find((g) => g.slug === slug) || null

  // Search and brand filters. They belong to one category, so moving to another category starts clean.
  const [filters, setFilters] = useState({ slug, brand: 'All', query: '' })
  const { brand, query } = filters.slug === slug ? filters : { brand: 'All', query: '' }
  const updateFilters = (patch) => setFilters({ slug, brand, query, ...patch })
  const brandOptions = useMemo(() => [...new Set((group?.products || []).map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [group])
  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (group?.products || []).filter((p) => (brand === 'All' || p.brand === brand) && (!q || p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.specs || '').toLowerCase().includes(q)))
  }, [group, brand, query])

  useEffect(() => {
    if (group) applyPageMeta({ ...categoryMeta(group), path: categoryPath(group.name) })
    else applyPageMeta({ title: 'Category not found | DECODE IT Solutions', description: 'This category is no longer available.', noindex: true, path: `/category/${slug}` })
  }, [group, slug])

  if (!group) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-brand-charcoal">Category not found</h1>
        <p className="mt-3 text-gray-600">This category may have been renamed or removed.</p>
        <SiteLink to="/shop" className="mt-6 inline-block rounded-full bg-brand-yellow px-6 py-3 font-bold text-brand-charcoal hover:bg-brand-orange">Browse the shop</SiteLink>
      </div>
    )
  }

  const copy = categoryCopy(group)
  const faq = faqFor(group.name)
  const others = groups.filter((g) => g.slug !== group.slug)

  return (
    <div className="bg-gray-50 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: categoryJsonLd(group, copy, faq) }} />

      <section className="page-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-1">
              <li><SiteLink to="/" className="hover:text-brand-charcoal hover:underline">Home</SiteLink></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li><SiteLink to="/shop" className="hover:text-brand-charcoal hover:underline">Shop</SiteLink></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="font-medium text-brand-charcoal">{group.name}</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-3xl font-bold text-brand-charcoal md:text-5xl">{copy.heading}</h1>
          <div className="mt-4 max-w-3xl space-y-3 text-lg text-gray-600">
            {copy.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {group.brands.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={`Brands in ${group.name}`}>
              {group.brands.map(({ brand, count }) => (
                <li key={brand} className="rounded-full bg-white shadow-sm ring-1 ring-slate-200 px-3 py-1 text-sm text-gray-700">{brand} <span className="text-gray-500">({count})</span></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8" aria-label={`${group.name} products`}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              placeholder={`Search ${group.name.toLowerCase()}...`}
              aria-label={`Search ${group.name}`}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          {brandOptions.length > 1 && (
            <select
              value={brand}
              onChange={(e) => updateFilters({ brand: e.target.value })}
              aria-label="Filter by brand"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="All">All brands</option>
              {brandOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          )}
        </div>
        <p className="mb-6 text-gray-600" aria-live="polite">
          {visibleProducts.length === group.products.length ? (
            <><span className="font-semibold text-brand-charcoal">{group.products.length}</span> product{group.products.length === 1 ? '' : 's'}</>
          ) : (
            <>Showing <span className="font-semibold text-brand-charcoal">{visibleProducts.length}</span> of {group.products.length} products</>
          )}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ShopProductCard
              key={product.id}
              product={product}
              offers={offers}
              view="grid"
              onOrder={startOrder}
              onQuote={requestQuote}
              onOpen={(p) => trackProductClick({ productId: p.id, label: p.name })}
            />
          ))}
        </div>
        {visibleProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">No products match your search.</p>
            <button type="button" onClick={() => updateFilters({ brand: 'All', query: '' })} className="mt-3 font-semibold text-brand-charcoal underline">Clear filters</button>
          </div>
        )}
      </section>

      <section className="mx-auto mt-14 max-w-3xl px-4 sm:px-6" aria-label="Frequently asked questions">
        <h2 className="text-2xl font-bold text-brand-charcoal">Questions about {group.name.toLowerCase()}</h2>
        <div className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {faq.map(({ q, a }) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold text-brand-charcoal marker:content-none">{q}</summary>
              <p className="mt-2 text-gray-700">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Other categories">
          <h2 className="text-2xl font-bold text-brand-charcoal">Shop other categories</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {others.map((other) => (
              <li key={other.slug}>
                <SiteLink to={categoryPath(other.name)} className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-brand-charcoal hover:border-brand-yellow hover:bg-yellow-50">
                  {other.name} <span className="text-gray-500">({other.products.length})</span>
                </SiteLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {checkoutProduct && <CheckoutModal product={checkoutProduct} offers={offers} onClose={closeCheckout} onSend={sendOrder} />}
    </div>
  )
}
