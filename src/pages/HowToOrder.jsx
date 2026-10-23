import { BadgePercent, Clock, FileText, MapPin, MessageCircle, Phone, ShoppingCart } from 'lucide-react'
import SiteLink from '../components/SiteLink'
import { telHref, useSiteSettings } from '../siteSettings'

const STEPS = [
  {
    title: 'Find your products',
    body: 'Open the Shop and browse by category, search by name or brand, and look out for the Hot products and Best sellers at the top.',
  },
  {
    title: 'Add them to your cart',
    body: 'Tap the small cart icon on a product photo (or Add to cart on its page). Keep shopping and add as many as you need, up to 12 different products. Your cart is remembered for 30 days.',
  },
  {
    title: 'Check your cart',
    body: 'Tap the cart icon in the top menu. Change quantities with + and −, remove anything you do not want, and type your delivery address (area, street or building). You can leave the address blank and give it on WhatsApp.',
  },
  {
    title: 'Send your order on WhatsApp',
    body: 'Tap Send order on WhatsApp. Your message opens in WhatsApp already written, with every item, its quantity and a link to its photo. Just press send, and please leave the Order ref line in.',
    whatsapp: true,
  },
  {
    title: 'We confirm and you receive',
    body: 'Our team replies on WhatsApp to confirm the price, availability and delivery or pickup. Pay by M-Pesa or bank transfer, then we deliver, or you collect from our shop.',
  },
]

const FAQ = [
  { q: 'Do I need an account to order?', a: 'No. You can order as a guest. A free account gives you member discounts, coupon codes and delivery offers in your cart before you send the order.' },
  { q: 'When do I pay?', a: 'After we have confirmed the price and availability with you on WhatsApp. You can pay by M-Pesa or bank transfer.' },
  { q: 'Can you deliver, or do I collect?', a: 'Both are possible. Give your delivery address in the cart, or tell us on WhatsApp, and we confirm delivery or pickup with you.' },
  { q: 'How many products can I put in the cart?', a: 'Up to 12 different products, with up to 999 of each. The cart is saved in your browser for 30 days and is the same on the main site and the shop address.' },
  { q: 'What if I only want one product, or need a quote?', a: 'Use the Order button on a product to send just that item. Use Get Quote for bulk orders or specification questions, and type the quantity you need after "Quantity needed".' },
  { q: 'Are the prices final?', a: 'Prices and availability are always confirmed with you on WhatsApp before you pay anything, because stock can change during the day.' },
]

function faqJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  // "<" is escaped so the JSON can never close the surrounding script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function HowToOrder() {
  const { contact, hours, whatsappUrl } = useSiteSettings()
  return (
    <div className="bg-gray-50 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />

      <section className="page-hero">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-brand-charcoal md:text-5xl">
            How to <span className="text-brand-ember">order online</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Pick what you need, then send your order on WhatsApp.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <SiteLink to="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 font-bold text-brand-charcoal hover:bg-brand-orange">
              <ShoppingCart size={18} aria-hidden="true" /> Go to the Shop
            </SiteLink>
            <a href="/how-to-order.pdf" target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-charcoal px-6 py-3 font-bold text-brand-charcoal hover:bg-brand-charcoal hover:text-white">
              <FileText size={18} aria-hidden="true" /> Download as PDF
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 lg:px-8" aria-label="Ordering steps">
        <h2 className="text-2xl font-bold text-brand-charcoal">Order in 5 easy steps</h2>
        <ol className="mt-6 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${step.whatsapp ? 'bg-green-600' : 'bg-brand-charcoal'}`}>{index + 1}</span>
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal">
                  {step.title}
                  {step.whatsapp && <MessageCircle size={18} className="text-green-600" aria-hidden="true" />}
                </h3>
                <p className="mt-1 text-gray-700">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-brand-charcoal">Only one item, or need a quote?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              <li><b>Order</b> on a product sends just that item, with your quantity and address.</li>
              <li><b>Get Quote</b> opens a message for bulk or specification questions.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal"><BadgePercent size={18} aria-hidden="true" /> Member offers</h3>
            <p className="mt-2 text-gray-700">
              Create a free account with <b>Sign up</b> in the Shop. Signed-in members see <b>discounts, coupon codes and delivery offers</b> in their cart before they send the order.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-3xl px-4 sm:px-6" aria-label="Frequently asked questions">
        <h2 className="text-2xl font-bold text-brand-charcoal">Common questions</h2>
        <div className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="p-5">
              <summary className="cursor-pointer list-none font-semibold text-brand-charcoal marker:content-none">{q}</summary>
              <p className="mt-2 text-gray-700">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6 lg:px-8" aria-label="Contact">
        <div className="grid gap-4 rounded-2xl bg-brand-black p-6 text-white md:grid-cols-3">
          <div className="flex gap-3">
            <MapPin size={20} className="mt-0.5 shrink-0 text-brand-yellow" aria-hidden="true" />
            <p className="whitespace-pre-line"><b>Visit us</b><br />{contact.address}</p>
          </div>
          <div className="flex gap-3">
            <Clock size={20} className="mt-0.5 shrink-0 text-brand-yellow" aria-hidden="true" />
            <p><b>Opening hours</b>{hours.map(({ days, time }) => <span key={days} className="block">{days}: {time}</span>)}</p>
          </div>
          <div className="flex gap-3">
            <Phone size={20} className="mt-0.5 shrink-0 text-brand-yellow" aria-hidden="true" />
            <p>
              <b>WhatsApp &amp; call</b>
              {[contact.mobilePhone, contact.officePhone].filter(Boolean).map((phone) => (
                <a key={phone} href={telHref(phone)} className="block hover:underline">{phone}</a>
              ))}
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Questions? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-charcoal underline">Chat with us on WhatsApp</a> or visit the <SiteLink to="/contact" className="font-semibold text-brand-charcoal underline">Contact page</SiteLink>.
        </p>
      </section>
    </div>
  )
}
