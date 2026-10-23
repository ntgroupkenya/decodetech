import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, MapPin, MessageCircle, Wallet } from 'lucide-react'
import { api, assetUrl, trackProductClick } from '../api'
import { SITE_URL, applyPageMeta, canonicalUrl, productMeta } from '../pageMeta'
import { productPath } from '../productSlug'
import { productPhotos } from '../productPhotos'
import { categorySlug } from '../categories'
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
import ShopProductCard from '../components/ShopProductCard'

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
    return products.filter((p) => p.id !== product.id && p.active !== false && p.inShop !== false && p.category === product.category).slice(0, 5)
  }, [products, product])

  if (!product) {
    return (
      <div className="min-h-[60vh] px-4 py-20 text-center">
        {lookupDone ? (
          <>
            <h1 className="text-3xl font-bold text-brand-charcoal">Product not found</h1>
            <p className="mt-3 text-gray-600">This product may have been removed or renamed.</p>
            <Link to="/" className="mt-6 inline-block rounded-md bg-brand-primary px-6 py-3 font-semibold text-white hover:bg-brand-primary-dark">Browse the shop</Link>
          </>
        ) : (
          <p className="text-gray-500">Loading product…</p>
        )}
      </div>
    )
  }

  const { images, placeholder } = productPhotos(product)
  const hasBrand = product.brand && product.brand.toLowerCase() !== 'generic'
  const categoryHref = product.category ? `/?cat=${categorySlug(product.category)}` : null
  const onOpen = (item) => trackProductClick({ productId: item.id, label: item.name })

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product) }} />

      <nav aria-label="Breadcrumb" className="border-b border-gray-200 bg-white">
        <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-3 text-sm text-gray-500 sm:px-6 lg:px-8">
          <li><Link to="/" className="hover:text-brand-charcoal hover:underline">Shop</Link></li>
          {product.category && (
            <>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li><Link to={categoryHref} className="hover:text-brand-charcoal hover:underline">{product.categoryName || product.category}</Link></li>
            </>
          )}
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          <li aria-current="page" className="truncate font-medium text-brand-charcoal">{product.name}</li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-col-reverse gap-3 rounded-md border border-gray-200 bg-white p-3 sm:flex-row">
            {images.length > 1 && (
              <ul className="no-scrollbar flex gap-2 overflow-x-auto sm:w-20 sm:flex-col" aria-label="Product photos">
                {images.map((src, index) => (
                  <li key={src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show photo ${index + 1}`}
                      aria-current={index === activeImage ? 'true' : undefined}
                      className={`h-16 w-16 overflow-hidden rounded-md border-2 bg-slate-50 sm:h-20 sm:w-20 ${index === activeImage ? 'border-brand-teal' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <img src={assetUrl(src)} alt="" loading="lazy" className="h-full w-full object-contain p-1 mix-blend-multiply" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="min-w-0 flex-1 overflow-hidden rounded-md">
              <ProductImage key={images[activeImage] || 'none'} src={images[activeImage]} placeholder={placeholder} alt={product.name} onOpen={() => onOpen(product)} />
            </div>
          </div>

          {product.specs && (
            <section className="rounded-md border border-gray-200 bg-white">
              <h2 className="border-b border-gray-200 px-5 py-3 text-lg font-bold text-brand-charcoal">Specifications</h2>
              <p className="whitespace-pre-line px-5 py-4 text-gray-700">{product.specs}</p>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-md border border-gray-200 bg-white p-5">
            {(hasBrand || product.condition) && (
              <div className="flex flex-wrap items-center gap-2">
                {hasBrand && <p className="font-mono text-xs font-bold uppercase tracking-wide text-brand-primary">{product.brand}</p>}
                <ConditionTag condition={product.condition} />
              </div>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-tight text-brand-charcoal md:text-3xl">{product.name}</h1>
            <HotFeature feature={product.hotFeature} className="mt-2" />

            <div className="mt-5 border-t border-gray-100 pt-4">
              <PriceLine product={product} offers={offers} size="lg" />
              {product.freeGift && <div className="mt-3"><FreeGiftBadge gift={product.freeGift} inline /></div>}
            </div>

            <div className="mt-5 space-y-2">
              <AddToCartButton product={product} variant="full" />
              <button
                type="button"
                onClick={() => startOrder(product)}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-green-700"
              >
                <MessageCircle size={20} /> Order via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => requestQuote(product)}
                className="w-full rounded-md border border-gray-300 px-6 py-3 font-semibold text-brand-charcoal transition-colors hover:border-brand-primary"
              >
                Get an expert quote
              </button>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <li className="flex items-start gap-3"><MessageCircle size={16} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" /> Price and availability are confirmed with you on WhatsApp.</li>
              <li className="flex items-start gap-3"><Wallet size={16} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" /> Pay by M-Pesa or bank transfer.</li>
              <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" /> Delivery, or pick up from our shop.</li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Related products">
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-brand-charcoal">More in {product.categoryName || product.category}</h2>
            <Link to={categoryHref} className="text-sm font-medium text-brand-primary hover:underline">See all</Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((item) => (
              <li key={item.id}>
                <ShopProductCard product={item} offers={offers} onOrder={startOrder} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {checkoutProduct && <CheckoutModal product={checkoutProduct} offers={offers} onClose={closeCheckout} onSend={sendOrder} />}
    </div>
  )
}
