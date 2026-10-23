import { canonicalUrl } from '../pageMeta'
import { productPath } from '../productSlug'
import { offerApplies, priceAfter } from '../offerMath'

const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`

// One cart line with the member's best price: the cheapest of the automatic member discounts and the
// chosen coupon that apply to this product (offers do not stack, same rule as a single order).
export function priceLine(product, qty, offers, couponId) {
  const candidates = offers.filter((o) => (o.type === 'discount' || (o.type === 'coupon' && o.id === couponId)) && offerApplies(o, product))
  const listed = product.price != null ? Number(product.price) : null
  let offer = candidates[0] || null
  let unit = listed
  if (listed != null && candidates.length) {
    const best = candidates.map((o) => ({ o, price: priceAfter(o, listed) })).sort((a, b) => a.price - b.price)[0]
    offer = best.o
    unit = best.price
  }
  return { product, qty, listed, unit, offer, lineTotal: unit != null ? Math.round(unit * qty * 100) / 100 : null }
}

export function cartTotals(lines) {
  const priced = lines.filter((l) => l.lineTotal != null)
  return {
    total: Math.round(priced.reduce((sum, l) => sum + l.lineTotal, 0) * 100) / 100,
    pricedCount: priced.length,
    unpricedCount: lines.length - priced.length,
  }
}

// A short reference that ties the lines of one cart together in the WhatsApp chat and in the admin Orders tab.
export const makeCartRef = () => Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, 'X')

// The one WhatsApp message for the whole cart. Each item gets its own page link; WhatsApp shows a photo
// card for the first one.
export function buildCartMessage({ lines, address, user, coupon, delivery, ref }) {
  const items = lines.map((l, i) => {
    const brand = l.product.brand && l.product.brand.toLowerCase() !== 'generic' ? ` (${l.product.brand})` : ''
    const price =
      l.unit != null ? ` - ${kes(l.unit)} each${l.qty > 1 ? ` = ${kes(l.lineTotal)}` : ''}` : ' - price to be confirmed'
    return `${i + 1}. ${l.product.name}${brand} x ${l.qty}${price}\n   ${canonicalUrl(productPath(l.product))}`
  })

  const { total, pricedCount, unpricedCount } = cartTotals(lines)
  const details = []
  if (pricedCount > 0) {
    const extra = unpricedCount > 0 ? ` (plus ${unpricedCount} item${unpricedCount === 1 ? '' : 's'} priced on WhatsApp)` : ''
    details.push(`Estimated total: ${kes(total)}${extra}`)
  }
  details.push(`Delivery address: ${address.trim() || 'to be confirmed on WhatsApp'}`)
  if (user) details.push(`Member: ${user.name || user.username} (${user.username})${user.phone ? `, ${user.phone}` : ''}`)

  const usedOffers = [...new Map(lines.filter((l) => l.offer).map((l) => [l.offer.id, l.offer])).values()]
  const discounts = usedOffers.filter((o) => o.type === 'discount')
  if (discounts.length) details.push(`Member discount: ${discounts.map((o) => o.title).join(', ')}`)
  if (coupon && usedOffers.some((o) => o.id === coupon.id)) details.push(`Coupon ${coupon.code}: ${coupon.title}`)
  if (delivery) details.push(`Delivery offer: ${delivery.title}`)

  return [
    "Hi, I'd like to order these items:",
    items.join('\n'),
    details.join('\n'),
    'Please confirm the current prices, availability, and delivery or pickup.',
    `Order ref: ${ref}`,
  ].join('\n\n')
}
