import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, Check, MessageCircle, Minus, Plus, ShoppingCart, Ticket, Trash2, Truck, X } from 'lucide-react'
import { api, assetUrl, recordOrder, trackWhatsApp } from '../api'
import { whatsappMessageUrl } from '../contact'
import { productPath } from '../productSlug'
import { productPhotos } from '../productPhotos'
import LaptopPlaceholder from './LaptopPlaceholder'
import useAuth from '../auth/useAuth'
import useCart from '../cart/useCart'
import { buildCartMessage, cartTotals, makeCartRef, priceLine } from '../cart/cartMessage'
import { offerApplies, offerLabel } from '../offerMath'
import useOffers from '../useOffers'
import useProducts from '../useProducts'

const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`

// The shopping cart: a panel with the items, member offers, delivery address and one WhatsApp order for everything.
export default function CartDrawer() {
  const { items, count, isOpen, notice, setQty, remove, clear, open, close } = useCart()
  const { user } = useAuth()
  const offers = useOffers()
  const products = useProducts()

  const [fetched, setFetched] = useState({}) // products found one by one (added after the page was built)
  const [couponId, setCouponId] = useState(null)
  const [deliveryId, setDeliveryId] = useState(null)
  const [code, setCode] = useState('')
  const [codeMessage, setCodeMessage] = useState({ ok: true, text: '' })
  const [address, setAddress] = useState('')

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const missingIds = items.map((i) => i.id).filter((id) => !byId.has(id) && !(id in fetched))
  const missingKey = missingIds.join(',')

  useEffect(() => {
    if (!isOpen || !missingKey) return undefined
    let cancelled = false
    for (const id of missingKey.split(',')) {
      api(`/products/${encodeURIComponent(id)}`)
        .then((data) => !cancelled && setFetched((f) => ({ ...f, [id]: data.product })))
        .catch(() => !cancelled && setFetched((f) => ({ ...f, [id]: null })))
    }
    return () => {
      cancelled = true
    }
  }, [isOpen, missingKey])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const resolved = items.map((item) => ({ item, product: byId.get(item.id) || fetched[item.id] || null, pending: !byId.has(item.id) && !(item.id in fetched) }))
  const unavailable = resolved.filter((r) => !r.product && !r.pending)
  const coupon = offers.find((o) => o.type === 'coupon' && o.id === couponId) || null
  const lines = resolved.filter((r) => r.product).map((r) => priceLine(r.product, r.item.qty, offers, couponId))
  const { total, pricedCount, unpricedCount } = cartTotals(lines)

  const coupons = offers.filter((o) => o.type === 'coupon' && lines.some((l) => offerApplies(o, l.product)))
  const deliveryOffers = offers.filter((o) => o.type === 'delivery' && lines.some((l) => offerApplies(o, l.product)))
  const delivery = deliveryOffers.find((o) => o.id === deliveryId) || null

  const applyCode = () => {
    const wanted = code.trim().toUpperCase()
    if (!wanted) return
    const match = offers.find((o) => o.type === 'coupon' && o.code === wanted)
    if (!match) setCodeMessage({ ok: false, text: 'That code is not recognised.' })
    else if (!lines.some((l) => offerApplies(match, l.product))) setCodeMessage({ ok: false, text: 'That coupon does not apply to anything in your cart.' })
    else {
      setCouponId(match.id)
      setCodeMessage({ ok: true, text: `Coupon ${match.code} applied.` })
    }
  }

  const send = () => {
    if (lines.length === 0) return
    const ref = makeCartRef()
    const message = buildCartMessage({ lines, address, user, coupon, delivery, ref })
    // One click record per item (for the "most clicked" ranking), and one order per item sharing the cart reference.
    for (const line of lines) trackWhatsApp({ label: 'Cart order', productId: line.product.id, message: '' })
    for (const line of lines) {
      recordOrder({
        productId: line.product.id,
        productName: line.product.name,
        message,
        offerIds: [line.offer?.id, delivery?.id].filter(Boolean),
        quantity: line.qty,
        deliveryAddress: address.trim(),
        cartRef: ref,
      })
    }
    window.open(whatsappMessageUrl(message), '_blank')
    clear()
    setAddress('')
    setCouponId(null)
    setDeliveryId(null)
    setCode('')
    close()
  }

  return (
    <>
      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-md bg-brand-charcoal px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-brand-teal/40">
          <Check size={18} className="shrink-0 text-brand-teal" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{notice.full ? notice.text : `${notice.text}: ${notice.name}`}</span>
          <button type="button" onClick={open} className="shrink-0 font-semibold text-brand-teal hover:underline">View cart</button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Your cart">
          <div className="absolute inset-0 bg-brand-ink/60" onClick={close} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand-charcoal px-5 py-4 text-white">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ShoppingCart size={20} aria-hidden="true" /> Your cart <span className="font-mono text-sm font-normal text-brand-teal">({count} item{count === 1 ? '' : 's'})</span></h2>
              <button type="button" onClick={close} aria-label="Close cart" className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingCart size={40} className="text-gray-300" aria-hidden="true" />
                <p className="mt-3 font-semibold text-brand-charcoal">Your cart is empty</p>
                <p className="mt-1 text-sm text-gray-600">Add several products, then send them to us in one WhatsApp order.</p>
                <Link to="/" onClick={close} className="mt-5 rounded-md bg-brand-indigo px-5 py-2.5 font-semibold text-white hover:bg-brand-indigo-dark">Browse the shop</Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                  <ul className="divide-y divide-gray-100">
                    {resolved.map(({ item, product, pending }) => (
                      <li key={item.id} className="flex gap-3 py-3">
                        {product && productPhotos(product).images[0] ? (
                          <img src={assetUrl(productPhotos(product).images[0])} alt="" className="h-16 w-16 shrink-0 rounded-md border border-gray-200 bg-slate-50 object-contain p-1" />
                        ) : product && productPhotos(product).placeholderBrand ? (
                          <LaptopPlaceholder brand={productPhotos(product).placeholderBrand} className="h-16 w-16 shrink-0 rounded-md border border-gray-200 bg-slate-50" />
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-md bg-gray-100" />
                        )}
                        <div className="min-w-0 flex-1">
                          {product ? (
                            <Link to={productPath(product)} onClick={close} className="line-clamp-2 text-sm font-semibold text-brand-charcoal hover:underline">{product.name}</Link>
                          ) : (
                            <p className="text-sm font-semibold text-gray-500">{pending ? 'Loading…' : 'No longer available'}</p>
                          )}
                          {product && (() => {
                            const line = lines.find((l) => l.product.id === product.id)
                            return (
                              <p className="mt-0.5 font-mono text-xs text-gray-600">
                                {line.unit == null ? 'Price on WhatsApp' : (
                                  <>
                                    {line.unit < line.listed && <span className="mr-1 text-gray-400 line-through">{kes(line.listed)}</span>}
                                    {kes(line.unit)} each
                                  </>
                                )}
                              </p>
                            )
                          })()}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="inline-flex items-center rounded-md border border-gray-300">
                              <button type="button" onClick={() => setQty(item.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Decrease quantity" className="p-1.5 hover:bg-gray-100 disabled:opacity-30"><Minus size={14} /></button>
                              <input
                                type="number"
                                min="1"
                                max="999"
                                value={item.qty}
                                onChange={(e) => setQty(item.id, e.target.value)}
                                aria-label={`Quantity of ${product?.name || 'item'}`}
                                className="w-12 border-x border-gray-300 py-1 text-center text-sm focus:outline-none"
                              />
                              <button type="button" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase quantity" className="p-1.5 hover:bg-gray-100"><Plus size={14} /></button>
                            </div>
                            <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${product?.name || 'item'}`} className="rounded p-1.5 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {unavailable.length > 0 && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Some items are no longer available. Remove them to continue.</p>}

                  <label className="block text-sm font-medium text-gray-700">
                    Delivery address <span className="font-normal text-gray-500">(optional)</span>
                    <textarea
                      rows={2}
                      maxLength={300}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Area, street or building. Leave blank to confirm on WhatsApp."
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-brand-teal"
                    />
                  </label>

                  {!user && (
                    <div className="rounded-md border border-brand-teal/50 bg-brand-teal/10 p-4 text-sm">
                      <p className="font-semibold text-brand-charcoal">Members get discounts, coupons and delivery offers</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link to="/signup" state={{ from: '/' }} onClick={close} className="rounded-md bg-brand-indigo px-4 py-2 font-semibold text-white hover:bg-brand-indigo-dark">Create account</Link>
                        <Link to="/login" state={{ from: '/' }} onClick={close} className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-100">Log in</Link>
                      </div>
                    </div>
                  )}

                  {user && (
                    <div className="space-y-4 text-sm">
                      {lines.some((l) => l.offer?.type === 'discount') && (
                        <p className="flex items-start gap-2 rounded-md bg-green-50 p-3 text-green-900"><BadgePercent size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> Member discounts are applied to the items they cover.</p>
                      )}
                      {coupons.length > 0 && (
                        <fieldset>
                          <legend className="mb-2 flex items-center gap-2 font-semibold text-brand-charcoal"><Ticket size={16} aria-hidden="true" /> Coupon <span className="font-normal text-gray-500">(the better price wins per item)</span></legend>
                          <div className="flex flex-wrap gap-2">
                            {coupons.map((o) => (
                              <button key={o.id} type="button" aria-pressed={couponId === o.id} onClick={() => setCouponId(couponId === o.id ? null : o.id)} className={`rounded-md border px-3 py-1.5 text-left ${couponId === o.id ? 'border-brand-indigo bg-brand-indigo text-white' : 'border-gray-300 hover:border-brand-teal'}`}>
                                <span className="font-mono text-xs">{o.code}</span> <span className="block">{o.title}{offerLabel(o) && !o.title.toLowerCase().includes(offerLabel(o).toLowerCase()) ? ` (${offerLabel(o)})` : ''}</span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                      <div className="flex gap-2">
                        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCode())} placeholder="Have a coupon code?" aria-label="Coupon code" className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 uppercase placeholder:normal-case focus:border-transparent focus:ring-2 focus:ring-brand-teal" />
                        <button type="button" onClick={applyCode} className="rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-100">Apply</button>
                      </div>
                      {codeMessage.text && <p role="status" className={`text-xs ${codeMessage.ok ? 'text-green-700' : 'text-red-700'}`}>{codeMessage.text}</p>}
                      {deliveryOffers.length > 0 && (
                        <fieldset>
                          <legend className="mb-2 flex items-center gap-2 font-semibold text-brand-charcoal"><Truck size={16} aria-hidden="true" /> Delivery offer</legend>
                          <div className="space-y-2">
                            {deliveryOffers.map((o) => (
                              <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 hover:border-brand-teal">
                                <input type="radio" name="cart-delivery" className="mt-0.5 accent-[#5163ad]" checked={deliveryId === o.id} onChange={() => setDeliveryId(o.id)} />
                                <span><span className="font-medium">{o.title}</span>{o.description && <span className="block text-gray-600">{o.description}</span>}</span>
                              </label>
                            ))}
                            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:border-brand-teal">
                              <input type="radio" name="cart-delivery" className="accent-[#5163ad]" checked={deliveryId === null} onChange={() => setDeliveryId(null)} /> No delivery offer
                            </label>
                          </div>
                        </fieldset>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 px-5 py-4">
                  {pricedCount > 0 && (
                    <p className="mb-3 flex items-baseline justify-between text-sm">
                      <span className="text-gray-600">Estimated total{unpricedCount > 0 ? ` (+ ${unpricedCount} priced on WhatsApp)` : ''}</span>
                      <span className="font-mono text-lg font-bold text-brand-charcoal">{kes(total)}</span>
                    </p>
                  )}
                  <button type="button" onClick={send} disabled={lines.length === 0 || unavailable.length > 0} className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <MessageCircle size={18} /> Send order on WhatsApp
                  </button>
                  <p className="mt-2 text-center text-xs text-gray-500">Prices and availability are confirmed with you on WhatsApp.</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
