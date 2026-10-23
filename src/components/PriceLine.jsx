import { bestPriceOffer, offerLabel } from '../offerMath'

export default function PriceLine({ product, offers }) {
  // Automatic member discounts are previewed on the card; coupons and delivery deals are chosen at checkout.
  const deal = bestPriceOffer(offers.filter(o => o.type === 'discount'), product)
  const listed = product.price ? Number(product.price) : null
  const was = listed && Number(product.oldPrice) > listed ? Number(product.oldPrice) : null

  let content = 'Price and availability on request'
  if (listed && deal?.price != null && deal.price < listed) {
    content = (
      <>
        <span className="text-gray-400 line-through mr-2">KES {listed.toLocaleString()}</span>
        <span className="font-bold text-brand-charcoal">KES {Number(deal.price).toLocaleString()}</span>
        <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-800">Member price</span>
      </>
    )
  } else if (listed && was) {
    content = (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-nowrap">
        <span className="text-gray-400 line-through">KES {was.toLocaleString()}</span>
        <span className="font-bold text-brand-charcoal">KES {listed.toLocaleString()}</span>
        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">Save KES {(was - listed).toLocaleString()}</span>
      </span>
    )
  } else if (listed) {
    content = `KES ${listed.toLocaleString()} · confirm availability`
  } else if (deal) {
    content = `Member discount: ${offerLabel(deal.offer)} (price on request)`
  }
  return <p className="text-sm font-medium text-gray-600 mb-4">{content}</p>
}
