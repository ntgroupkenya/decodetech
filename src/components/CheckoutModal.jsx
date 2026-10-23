import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, MessageCircle, Ticket, Truck, X } from 'lucide-react'
import useAuth from '../auth/useAuth'
import { bestPriceOffer, offerApplies, offerLabel, priceAfter } from '../offerMath'

const kes = (n) => `KES ${Number(n).toLocaleString()}`

export default function CheckoutModal({ product, offers, onClose, onSend }) {
  const { user } = useAuth()

  const priceOffers = useMemo(() => offers.filter((o) => o.type !== 'delivery' && offerApplies(o, product)), [offers, product])
  const deliveryOffers = useMemo(() => offers.filter((o) => o.type === 'delivery' && offerApplies(o, product)), [offers, product])

  // Preselect the best price offer so members get the lowest price by default.
  const [priceOfferId, setPriceOfferId] = useState(() => bestPriceOffer(priceOffers, product)?.offer.id ?? null)
  const [deliveryId, setDeliveryId] = useState(null)
  const [code, setCode] = useState('')
  const [codeMessage, setCodeMessage] = useState({ ok: true, text: '' })
  const [quantityText, setQuantityText] = useState('1')
  const [address, setAddress] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const chosenPrice = priceOffers.find((o) => o.id === priceOfferId) || null
  const chosenDelivery = deliveryOffers.find((o) => o.id === deliveryId) || null
  const finalPrice = chosenPrice && product.price != null ? priceAfter(chosenPrice, product.price) : null

  // Whole units only, at least 1.
  const quantity = Math.min(9999, Math.max(1, Math.floor(Number(quantityText)) || 1))
  const unitPrice = finalPrice ?? product.price
  const total = unitPrice != null ? Math.round(unitPrice * quantity * 100) / 100 : null

  const applyCode = () => {
    const wanted = code.trim().toUpperCase()
    if (!wanted) return
    const match = offers.find((o) => o.type === 'coupon' && o.code === wanted)
    if (!match) setCodeMessage({ ok: false, text: 'That code is not recognised.' })
    else if (!offerApplies(match, product)) setCodeMessage({ ok: false, text: 'That coupon does not apply to this product.' })
    else {
      setPriceOfferId(match.id)
      setCodeMessage({ ok: true, text: `Coupon ${match.code} applied.` })
    }
  }

  const send = () => {
    const lines = []
    lines.push(`Quantity needed: ${quantity}`)
    lines.push(`Delivery address: ${address.trim() || 'to be confirmed on WhatsApp'}`)
    if (user) lines.push(`Member: ${user.name || user.username} (${user.username})${user.phone ? `, ${user.phone}` : ''}`)
    if (chosenPrice) {
      const label = offerLabel(chosenPrice)
      const showLabel = label && !chosenPrice.title.toLowerCase().includes(label.toLowerCase())
      lines.push(`${chosenPrice.type === 'coupon' ? `Coupon ${chosenPrice.code}` : 'Member discount'}: ${chosenPrice.title}${showLabel ? ` (${label})` : ''}`)
      if (finalPrice != null) lines.push(`Price after offer: ${kes(finalPrice)} each (listed ${kes(product.price)})`)
    }
    if (quantity > 1 && total != null) lines.push(`Estimated total for ${quantity}: ${kes(total)}`)
    if (chosenDelivery) lines.push(`Delivery offer: ${chosenDelivery.title}`)
    onSend({
      extra: lines.join('\n'),
      offerIds: [chosenPrice?.id, chosenDelivery?.id].filter(Boolean),
      quantity,
      address: address.trim(),
    })
  }

  const radio = 'mt-0.5 shrink-0 accent-[#2a336e]'

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-brand-black/60 p-4" role="dialog" aria-modal="true" aria-label="Before you order">
      <div className="my-8 w-full max-w-lg overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-brand-black px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Before you order</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="font-semibold text-brand-charcoal">{product.name}</p>
            <p className="font-mono text-xs font-bold uppercase text-brand-blue">{product.brand}</p>
            <p className="mt-1 font-mono text-sm">
              {product.price != null ? (
                <>
                  {finalPrice != null && finalPrice !== product.price && <span className="mr-2 text-gray-400 line-through">{kes(product.price)}</span>}
                  <span className="font-bold text-brand-charcoal">{kes(finalPrice ?? product.price)}</span>
                </>
              ) : (
                <span className="text-gray-600">Price confirmed on WhatsApp</span>
              )}
              {product.price != null && quantity > 1 && <span className="ml-2 text-gray-600">× {quantity} = <strong className="text-brand-charcoal">{kes(total)}</strong></span>}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium text-gray-700">
              Quantity needed
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="9999"
                step="1"
                value={quantityText}
                onChange={(e) => setQuantityText(e.target.value)}
                onBlur={() => setQuantityText(String(quantity))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
              />
            </label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">
              Delivery address <span className="font-normal text-gray-500">(optional)</span>
              <textarea
                rows={2}
                maxLength={300}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Area, street or building. Leave blank to confirm on WhatsApp."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
              />
            </label>
          </div>

          {!user && (
            <div className="rounded-md border border-brand-yellow/50 bg-brand-yellow/10 p-4">
              <p className="font-semibold text-brand-charcoal">Members get discounts, coupons and delivery offers</p>
              <p className="mt-1 text-sm text-gray-700">Create a free account or sign in to unlock them before you send your order.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/signup" state={{ from: window.location.pathname }} className="rounded-md bg-brand-charcoal px-4 py-2 text-sm font-semibold text-white hover:bg-brand-black">Create account</Link>
                <Link to="/login" state={{ from: window.location.pathname }} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100">Log in</Link>
              </div>
            </div>
          )}

          {user && priceOffers.length > 0 && (
            <fieldset>
              <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-charcoal"><BadgePercent size={16} /> Discount or coupon <span className="font-normal text-gray-500">(best one applies; they don’t stack)</span></legend>
              <div className="space-y-2">
                {priceOffers.map((o) => (
                  <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 text-sm hover:border-brand-yellow">
                    <input type="radio" name="price-offer" className={radio} checked={priceOfferId === o.id} onChange={() => setPriceOfferId(o.id)} />
                    <span>
                      <span className="font-medium">{o.title}</span>
                      {o.type === 'coupon' && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{o.code}</span>}
                      <span className="block text-gray-600">{offerLabel(o)}{o.description ? ` · ${o.description}` : ''}</span>
                    </span>
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 text-sm hover:border-brand-yellow">
                  <input type="radio" name="price-offer" className={radio} checked={priceOfferId === null} onChange={() => setPriceOfferId(null)} />
                  No discount
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCode())}
                    placeholder="Have a coupon code?"
                    aria-label="Coupon code"
                    className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm uppercase placeholder:normal-case focus:border-transparent focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
                <button type="button" onClick={applyCode} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">Apply</button>
              </div>
              {codeMessage.text && <p role="status" className={`mt-1 text-xs ${codeMessage.ok ? 'text-green-700' : 'text-red-700'}`}>{codeMessage.text}</p>}
            </fieldset>
          )}

          {user && deliveryOffers.length > 0 && (
            <fieldset>
              <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-charcoal"><Truck size={16} /> Delivery offer</legend>
              <div className="space-y-2">
                {deliveryOffers.map((o) => (
                  <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 text-sm hover:border-brand-yellow">
                    <input type="radio" name="delivery-offer" className={radio} checked={deliveryId === o.id} onChange={() => setDeliveryId(o.id)} />
                    <span><span className="font-medium">{o.title}</span>{o.description && <span className="block text-gray-600">{o.description}</span>}</span>
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 text-sm hover:border-brand-yellow">
                  <input type="radio" name="delivery-offer" className={radio} checked={deliveryId === null} onChange={() => setDeliveryId(null)} />
                  No delivery offer
                </label>
              </div>
            </fieldset>
          )}

          {user && priceOffers.length === 0 && deliveryOffers.length === 0 && (
            <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">No member offers apply to this product right now.</p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">Cancel</button>
          <button type="button" onClick={send} className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <MessageCircle size={18} /> {user ? 'Send order on WhatsApp' : 'Continue without offers'}
          </button>
        </div>
      </div>
    </div>
  )
}
