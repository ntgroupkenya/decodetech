import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import SiteLink from '../components/SiteLink'
import { ChevronRight, MapPin, MessageCircle, Wallet } from 'lucide-react'
import { api, assetUrl, trackProductClick } from '../api'
import { SITE_URL, applyPageMeta, canonicalUrl, productMeta } from '../pageMeta'
import { productPath } from '../productSlug'
import { categoryPath } from '../categories'
import useProducts from '../useProducts'
import useOffers from '../useOffers'
import useOrdering from '../useOrdering'
import CheckoutModal from '../components/CheckoutModal'
import PriceLine from '../components/PriceLine'
import FreeGiftBadge from '../components/FreeGiftBadge'
import ConditionTag from '../components/ConditionTag'
import HotFeature from '../components/HotFeature'
import AddToCartButton from '../components/AddToCartButton'
import ProductImage from '../components/ProductImage'

const absolute = (url) => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`)

// Structured data so search engines understand the product. Price is only included when one is set,
// and availability is left out because stock is confirmed with the customer on WhatsApp.
function productJsonLd(product) {
  const images = [product.image, ...(product.alternateImages || [])].filter(Boolean).map((src) => absolute(assetUrl(src)))
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.id,
    url: canonicalUrl(productPath(product)),
    description: product.specs || productMeta(product).description,
    ...(images.length ? { image: images } : {}),
    ...(product.brand && product.brand.toLowerCase() !== 'generic' ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.categoryName || product.category ? { category: product.categoryName || product.category } : {}),
    ...(product.price
      ? { offers: { '@type': 'Offer', url: canonicalUrl(productPath(product)), priceCurrency: 'KES', price: String(product.price), seller: { '@type': 'Organization', name: 'DECODE IT Solutions' } } }
      : {}),
  }
  // "<" is escaped so the JSON can never close the surrounding script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function ProductPage() {
  const { id } = useParams()
  const products = useProducts()
  const offers = useOffers()
  const { checkoutProduct, startOrder, closeCheckout, sendOrder, requestQuote } = useOrdering()

  const fromList = useMemo(() => products.find((p) => p.id === id) || null, [products, id])
  // A product added after the page was built is fetched on its own.
  const [remote, setRemote] = useState({ id: null, product: null })
  useEffect(() => {
    if (fromList) return undefined
    let cancelled = false
    api(`/products/${encodeURIComponent(id)}`)
      .then((data) => !cancelled && setRemote({ id, product: data.product }))
      .catch(() => !cancelled && setRemote({ id, product: null }))
    return () => {
      cancelled = true
    }
  }, [id, fromList])

  const product = fromList || (remote.id === id ? remote.product : null)
  const lookupDone = Boolean(fromList) || remote.id === id
  const [activeImage, setActiveImage] = useState(0)
  useEffect(() => {
    setActiveImage(0) // eslint-disable-line react-hooks/set-state-in-effect
  }, [id])

  useEffect(() => {
    if (product) applyPageMeta({ ...productMeta(product), path: productPath(product) })
    else if (lookupDone) {
      applyPageMeta({ title: 'Product not found | DECODE IT Solutions', description: 'This product is no longer available.', noindex: true, path: `/product/${id}` })
    }
  }, [product, lookupDone, id])

  const related = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.id !== product.id && p.active !== false && p.category === product.category).slice(0, 4)
  }, [products, product])

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-20 text-center">
        {lookupDone ? (
          <>
            <h1 className="text-3xl font-bold text-brand-charcoal">Product not found</h1>
            <p className="mt-3 text-gray-600">This product may have been removed or renamed.</p>
            <SiteLink to="/shop" className="mt-6 inline-block rounded-full bg-brand-yellow px-6 py-3 font-bold text-brand-charcoal hover:bg-brand-orange">Browse the shop</SiteLink>
          </>
        ) : (
          <p className="text-gray-500">Loading product…</p>
        )}
      </div>
    )
  }

  const images = [product.image, ...(product.alternateImages || [])].filter(Boolean)
  const hasBrand = product.brand && product.brand.toLowerCase() !== 'generic'

  return (
    <div className="bg-gray-50 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product) }} />

      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-4 text-sm text-gray-600 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1">
          <li><SiteLink to="/" className="hover:underline">Home</SiteLink></li>
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          <li><SiteLink to="/shop" className="hover:underline">Shop</SiteLink></li>
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          {product.category && (
            <>
              <li><SiteLink to={categoryPath(product.category)} className="hover:underline">{product.category}</SiteLink></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
            </>
          )}
          <li aria-current="page" className="font-medium text-brand-charcoal">{product.name}</li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {images.length > 0 ? (
              <ProductImage
                key={images[activeImage]}
                src={images[activeImage]}
                alt={product.name}
                onOpen={() => trackProductClick({ productId: product.id, label: product.name })}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-gray-400">No photo yet</div>
            )}
          </div>
          {images.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label="Product photos">
              {images.map((src, index) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={index === activeImage ? 'true' : undefined}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 bg-white ${index === activeImage ? 'border-brand-yellow' : 'border-gray-200'}`}
                  >
                    <img src={assetUrl(src)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {(hasBrand || product.condition) && (
            <div className="flex flex-wrap items-center gap-2">
              {hasBrand && <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{product.brand}</p>}
              <ConditionTag condition={product.condition} />
            </div>
          )}
          <h1 className="mt-1 text-3xl font-bold text-brand-charcoal md:text-4xl">{product.name}</h1>
          <HotFeature feature={product.hotFeature} className="mt-2" />
          {product.category && (
            <p className="mt-2 text-sm text-gray-600">
              <SiteLink to={categoryPath(product.category)} className="hover:underline">{product.categoryName || product.category}</SiteLink>
            </p>
          )}

          <div className="mt-6 text-lg">
            <PriceLine product={product} offers={offers} />
            {product.freeGift && <div className="-mt-2 mb-4"><FreeGiftBadge gift={product.freeGift} inline /></div>}
          </div>

          {product.specs && (
            <section className="mt-2">
              <h2 className="text-lg font-semibold text-brand-charcoal">Specifications</h2>
              <p className="mt-2 whitespace-pre-line text-gray-700">{product.specs}</p>
            </section>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => startOrder(product)}
              className="flex min-w-[13rem] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle size={20} /> Order via WhatsApp
            </button>
            <AddToCartButton product={product} variant="full" />
            <button
              type="button"
              onClick={() => requestQuote(product)}
              className="min-w-[13rem] flex-1 whitespace-nowrap rounded-full bg-brand-yellow px-6 py-3 font-semibold text-brand-charcoal transition-colors hover:bg-brand-orange"
            >
              Get Expert Quote
            </button>
          </div>

          <ul className="mt-8 space-y-3 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
            <li className="flex items-start gap-3"><MessageCircle size={18} className="mt-0.5 shrink-0 text-brand-charcoal" aria-hidden="true" /> Price and availability are confirmed with you on WhatsApp.</li>
            <li className="flex items-start gap-3"><Wallet size={18} className="mt-0.5 shrink-0 text-brand-charcoal" aria-hidden="true" /> Pay by M-Pesa or bank transfer.</li>
            <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand-charcoal" aria-hidden="true" /> Delivery, or pick up from our shop.</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Related products">
          <h2 className="text-2xl font-bold text-brand-charcoal">More in {product.categoryName || product.category}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <SiteLink to={productPath(item)} className="block">
                  <img src={assetUrl(item.image)} alt={item.name} loading="lazy" className="aspect-square w-full object-cover" />
                  <span className="block p-3 text-sm font-semibold text-brand-charcoal">{item.name}</span>
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
