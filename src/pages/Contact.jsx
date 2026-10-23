import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useState } from 'react'
import { whatsappMessageUrl } from '../contact'
import { telHref, useSiteSettings } from '../siteSettings'
import { recordMessage, trackWhatsApp } from '../api'
import PageHeader from '../components/PageHeader'

export default function Contact() {
  const { contact, hours, whatsappUrl } = useSiteSettings()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    budget: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const whatsappMessage = `Hi, I'm interested in your products.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nProduct: ${formData.product}\nBudget Range: ${formData.budget}\nMessage: ${formData.message}`
    recordMessage(formData)
    trackWhatsApp({ label: 'Contact form', message: whatsappMessage })
    window.open(whatsappMessageUrl(whatsappMessage), '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader eyebrow="Contact" title="Let's talk" accent="tech" intro="Questions, quotes or technical help: reach the DECODE team on WhatsApp, by phone or in person." />

      {/* Contact Information & Message Form */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-8 ring-1 ring-slate-200">
              <h2 className="text-3xl font-bold text-brand-charcoal mb-8">Reach us</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-3 rounded-lg">
                    <MapPin size={24} className="text-brand-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-charcoal mb-1">Our Location</h3>
                    <p className="whitespace-pre-line text-gray-600">{contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-3 rounded-lg">
                    <Phone size={24} className="text-brand-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-charcoal mb-1">Phone & WhatsApp</h3>
                    {[contact.mobilePhone, contact.officePhone].filter(Boolean).map((phone) => (
                      <p key={phone} className="text-gray-600">
                        <a href={telHref(phone)} className="hover:text-brand-ember transition-colors">{phone}</a>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-3 rounded-lg">
                    <Mail size={24} className="text-brand-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-charcoal mb-1">Email</h3>
                    {[contact.email, contact.email2].filter(Boolean).map((email) => (
                      <p key={email} className="text-gray-600">
                        <a href={`mailto:${email}`} className="hover:text-brand-ember transition-colors">{email}</a>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow p-3 rounded-lg">
                    <Clock size={24} className="text-brand-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-charcoal mb-1">Opening Hours</h3>
                    <p className="text-gray-600">
                      {hours.map(({ days, time }) => <span key={days} className="block">{days}: {time}</span>)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Button */}
              <div className="mt-8">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-green-600 text-white px-6 py-4 rounded-full font-bold hover:bg-green-700 transition-colors"
                >
                  <span className="text-2xl">💬</span>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="w-full">
              <div className="bg-white rounded-2xl p-8 ring-1 ring-slate-200">
                <h2 className="text-3xl font-bold text-brand-charcoal mb-2">Send Us a Message</h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we'll get back to you via WhatsApp
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent" placeholder="+254 7XX XXX XXX" />
                  </div>
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">Product Inquiry</label>
                    <input type="text" id="product" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent" placeholder="e.g., laptop, CCTV kit, Wi-Fi router" />
                  </div>
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select id="budget" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent">
                      <option value="">Select budget range</option>
                      <option value="Under KSh 10,000">Under KSh 10,000</option>
                      <option value="KSh 10,000 - KSh 50,000">KSh 10,000 - KSh 50,000</option>
                      <option value="KSh 50,000 - KSh 100,000">KSh 50,000 - KSh 100,000</option>
                      <option value="KSh 100,000 - KSh 500,000">KSh 100,000 - KSh 500,000</option>
                      <option value="Over KSh 500,000">Over KSh 500,000</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea id="message" rows="4" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent" placeholder="Tell us more about your requirements..." />
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <Send size={20} />
                    <span>Send via WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Map: put the business name or address after q= (URL-encoded) */}
      <section className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-charcoal mb-6">Find Our Store</h2>
          <div className="bg-gray-200 rounded-xl overflow-hidden h-[28rem]">
            <iframe
              src="https://www.google.com/maps?q=Ridge%20House%2C%20Munyu%20Road%2C%20Nairobi%2C%20Kenya&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DECODE IT Solutions Location"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
