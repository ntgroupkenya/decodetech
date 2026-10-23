import { ArrowRight } from 'lucide-react'
import SiteLink from '../components/SiteLink'
import { brandInfo, brandProductsPath, groupBrands, orderOnlyBrands } from '../brands'
import useProducts from '../useProducts'
import PageHeader from '../components/PageHeader'

// Logo when we have one, otherwise the brand name set in the brand's own tile.
function BrandMark({ brand, className = 'h-28' }) {
  return (
    <div className={`${className} w-full flex items-center justify-center overflow-hidden bg-white rounded-lg`}>
      {brand.logo ? (
        <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" className="h-full w-full object-contain p-2" />
      ) : (
        <span className="px-3 text-center text-2xl font-extrabold uppercase tracking-wide text-brand-charcoal">{brand.name}</span>
      )}
    </div>
  )
}

// Brands shown as coloured cards at the top of the page (each needs a `card` image in src/brands.js).
const FEATURED = ['Lenovo', 'Microsoft', 'ASUS', 'Toshiba'].map(brandInfo).filter((brand) => brand.card)

export default function Brands() {
  const products = useProducts()
  const brands = groupBrands(products.filter((product) => product.inCatalog !== false))
  const orderOnly = orderOnlyBrands(brands)
  const productCount = brands.reduce((sum, brand) => sum + brand.count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader eyebrow="Partners" title="Brands we" accent="supply" intro="Genuine products from the manufacturers we trust, with warranty and support.">
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="rounded-2xl bg-white px-6 py-4 ring-1 ring-slate-200">
            <div className="font-heading text-3xl font-bold text-brand-charcoal">{brands.length}</div>
            <div className="text-sm text-gray-500">Brands in our catalogue</div>
          </div>
          <div className="rounded-2xl bg-white px-6 py-4 ring-1 ring-slate-200">
            <div className="font-heading text-3xl font-bold text-brand-charcoal">{productCount}</div>
            <div className="text-sm text-gray-500">Branded products online</div>
          </div>
        </div>
      </PageHeader>

      {/* Featured brands: the coloured brand cards (public/brands/*-card.jpg) */}
      <section className="bg-white pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow">Featured brands</p>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FEATURED.map((brand) => (
              <SiteLink key={brand.key} to={brandProductsPath(brand.name)} className="group overflow-hidden rounded-2xl ring-1 ring-slate-200 transition-shadow hover:shadow-lg">
                <img src={brand.card} alt={brand.name} loading="lazy" width="800" height="428" className="aspect-[800/428] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </SiteLink>
            ))}
          </div>
        </div>
      </section>

      {/* Quick jump to a brand */}
      <nav aria-label="Jump to a brand" className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-2">
          {brands.map((brand) => (
            <a
              key={brand.key}
              href={`#brand-${brand.key}`}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-yellow hover:text-brand-charcoal"
            >
              {brand.name} <span className="text-gray-500">({brand.count})</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Brand Cards (only when the catalogue has branded products) */}
      {brands.length > 0 && (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-brand-charcoal mb-4">Brands in Our Catalogue</h2>
            <p className="text-gray-600 max-w-2xl">
              Every brand below has products you can browse online today. Open a brand to see all of its products.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <article
                key={brand.key}
                id={`brand-${brand.key}`}
                className="scroll-mt-28 flex flex-col bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-brand-yellow transition-all hover:shadow-lg"
              >
                <div className="mb-4">
                  <BrandMark brand={brand} />
                </div>
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="text-xl font-bold text-brand-charcoal">{brand.name}</h3>
                  <span className="shrink-0 rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-charcoal">
                    {brand.count} product{brand.count === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{brand.blurb}</p>
                <p className="mb-5 text-xs uppercase tracking-wide text-gray-500">{brand.categories.join(' · ')}</p>
                <SiteLink
                  to={brandProductsPath(brand.name)}
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-brand-charcoal hover:text-brand-ember"
                >
                  View {brand.count === 1 ? 'the product' : `all ${brand.count} products`}
                  <ArrowRight size={16} />
                </SiteLink>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Brands we supply on order */}
      {orderOnly.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-charcoal mb-4">Also Available to Order</h2>
            <p className="text-gray-600 max-w-2xl mb-8">
              We also supply these brands. They aren't in the online catalogue yet, so ask us on WhatsApp or visit the shop for current stock.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {orderOnly.map((brand) => (
                <div key={brand.key} className="rounded-xl border border-gray-200 bg-white p-4">
                  <BrandMark brand={brand} className="h-20" />
                  <h3 className="mt-3 font-bold text-brand-charcoal">{brand.name}</h3>
                  <p className="text-sm text-gray-600">{brand.blurb}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Partnership Info */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-brand-charcoal mb-6">
                Why buy through DECODE
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-2 rounded-lg">
                    <span className="text-brand-charcoal font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-brand-charcoal font-semibold mb-1">Tested and trusted</h4>
                    <p className="text-gray-500 text-sm">
                      We only stock brands with a proven record for reliability and performance
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-2 rounded-lg">
                    <span className="text-brand-charcoal font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-brand-charcoal font-semibold mb-1">Genuine, warrantied stock</h4>
                    <p className="text-gray-500 text-sm">
                      Sourced through authorised channels, so every product is original
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-2 rounded-lg">
                    <span className="text-brand-charcoal font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-brand-charcoal font-semibold mb-1">Setup and configuration</h4>
                    <p className="text-gray-500 text-sm">
                      We help you set up and configure what you buy
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-2 rounded-lg">
                    <span className="text-brand-charcoal font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-brand-charcoal font-semibold mb-1">Support after the sale</h4>
                    <p className="text-gray-500 text-sm">
                      Accessories, replacements and technical help whenever you need them
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-yellow to-brand-orange rounded-xl p-8 text-brand-charcoal">
              <h3 className="text-2xl font-bold mb-4">Looking for a specific brand?</h3>
              <p className="mb-6">
                Tell us the brand or model you have in mind and we'll check availability and get you a quote.
              </p>
              <a
                href="/contact"
                className="inline-block bg-brand-charcoal text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors"
              >
                Ask about a brand
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
