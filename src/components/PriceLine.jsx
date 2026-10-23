import { bestPriceOffer, offerLabel } from '../offerMath'

const kes = (n) => `KES ${Number(n).toLocaleString()}`

// The price block on cards and product pages. `size="lg"` is the product page's larger version.
export default function PriceLine({ product, offers, size = 'md' }) {
  // Automatic member discounts are previewed on the card; coupons and delivery deals are chosen at checkout.
  const deal = bestPriceOffer(offers.filter(o => o.type === 'discount'), product)
  const listed = product.price ? Number(product.price) : null
  const was = listed && Number(product.oldPrice) > listed ? Number(product.oldPrice) : null
  const big = size === 'lg' ? 'text-3xl' : 'text-lg'

  if (listed && deal?.price != null && deal.price < listed) {
    return (
      <div className="font-mono">
        <p className={`${big} font-bold leading-tight text-brand-charcoal`}>{kes(deal.price)}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
          <span className="text-gray-400 line-through">{kes(listed)}</span>
          <span className="rounded-sm bg-brand-teal/20 px-1.5 py-0.5 font-semibold text-brand-charcoal">Member price</span>
        </p>
      </div>
    )
  }
  if (listed && was) {
    return (
      <div className="font-mono">
        <p className={`${big} font-bold leading-tight text-brand-charcoal`}>{kes(listed)}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
          <span className="text-gray-400 line-through">{kes(was)}</span>
          <span className="rounded-sm bg-brand-red/10 px-1.5 py-0.5 font-semibold text-brand-red">-{kes(was - listed)}</span>
        </p>
      </div>
    )
  }
  if (listed) {
    return (
      <div className="font-mono">
        <p className={`${big} font-bold leading-tight text-brand-charcoal`}>{kes(listed)}</p>
        <p className="mt-0.5 font-sans text-xs text-gray-500">Confirm stock on WhatsApp</p>
      </div>
    )
  }
  return (
    <div>
      <p className={`font-mono ${size === 'lg' ? 'text-xl' : 'text-base'} font-bold text-brand-charcoal`}>Price on request</p>
      <p className="mt-0.5 text-xs text-gray-500">{deal ? `Member discount: ${offerLabel(deal.offer)}` : 'Ask us on WhatsApp'}</p>
    </div>
  )
}
