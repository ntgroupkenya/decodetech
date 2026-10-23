// Mirrors the server's offer rules so the shop can preview what a member will get.
export function offerApplies(offer, product) {
  if (offer.category && offer.category.toLowerCase() !== (product.category || '').toLowerCase()) return false
  if (offer.minPrice != null && (product.price == null || product.price < offer.minPrice)) return false
  return true
}

export function priceAfter(offer, price) {
  let off = 0
  if (offer.percentOff != null) off = (price * offer.percentOff) / 100
  if (offer.amountOff != null) off = Math.max(off, offer.amountOff)
  return Math.max(0, Math.round((price - off) * 100) / 100)
}

export function offerLabel(offer) {
  if (offer.percentOff != null && offer.amountOff != null) return `${offer.percentOff}% off or KES ${offer.amountOff.toLocaleString()} off`
  if (offer.percentOff != null) return `${offer.percentOff}% off`
  if (offer.amountOff != null) return `KES ${offer.amountOff.toLocaleString()} off`
  return ''
}

// Best single price reduction among the chosen discount/coupon offers (they do not stack).
export function bestPriceOffer(offers, product) {
  const priced = offers.filter((o) => o.type !== 'delivery' && offerApplies(o, product))
  if (priced.length === 0) return null
  if (product.price == null) return { offer: priced[0], price: null }
  return priced.map((offer) => ({ offer, price: priceAfter(offer, product.price) })).sort((a, b) => a.price - b.price)[0]
}
