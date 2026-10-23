import { useState } from 'react'
import { whatsappMessageUrl } from './contact'
import { trackWhatsApp, recordOrder } from './api'
import { canonicalUrl } from './pageMeta'
import { productPath } from './productSlug'

// WhatsApp links can only carry text, so the photo travels as the product page's address: WhatsApp turns it
// into a card showing the product photo, name and description (from the page's share tags).
const productLink = (product) => `Product page: ${canonicalUrl(productPath(product))}`
const productFacts = (product) => `Brand: ${product.brand}\nSpecs: ${product.specs}`

// Shared by the Shop and the product pages: the member checkout step, then the WhatsApp message.
export default function useOrdering() {
  const [checkoutProduct, setCheckoutProduct] = useState(null)

  // The order only goes to WhatsApp after the shopper has had the chance to pick member offers.
  // `extra` carries the quantity, delivery address and any member offers chosen at checkout.
  const sendOrder = ({ extra, offerIds, quantity = 1, address = '' }) => {
    const product = checkoutProduct
    const message = [
      `Hi, I'm interested in the ${product.name}.`,
      productFacts(product),
      extra,
      'Please confirm the current price, availability, and delivery or pickup.',
      productLink(product),
    ]
      .filter(Boolean)
      .join('\n\n')
    trackWhatsApp({ label: 'Order via WhatsApp', productId: product.id, message })
    recordOrder({ productId: product.id, productName: product.name, message, offerIds, quantity, deliveryAddress: address })
    window.open(whatsappMessageUrl(message), '_blank')
    setCheckoutProduct(null)
  }

  // A quote request skips the checkout step, so the quantity and address are left for the customer to type in WhatsApp.
  const requestQuote = (product) => {
    const message = [
      `Hi, I need an expert quote for the ${product.name}.`,
      productFacts(product),
      'Quantity needed: \nDelivery address: ',
      'I would like guidance on specifications and bulk pricing options.',
      productLink(product),
    ].join('\n\n')
    trackWhatsApp({ label: 'Expert quote', productId: product.id, message })
    window.open(whatsappMessageUrl(message), '_blank')
  }

  return {
    checkoutProduct,
    startOrder: setCheckoutProduct,
    closeCheckout: () => setCheckoutProduct(null),
    sendOrder,
    requestQuote,
  }
}
