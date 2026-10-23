import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { telHref, useSiteSettings } from '../siteSettings'
import SocialIcon from './SocialIcon'
import SiteLink from './SiteLink'
import { TAGLINE } from '../siteDefaults'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { contact, hours, social } = useSiteSettings()
  return (
    <footer className="site-footer text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img
              src="/logo.png"
              alt="DECODE IT Solutions"
              className="h-14 w-56 object-contain object-left mb-4"
            />
            <p className="text-brand-ember text-sm italic mb-4">
              {TAGLINE}
            </p>
          </div>

          <div>
            <h4 className="footer-heading text-lg font-semibold mb-4 text-brand-charcoal">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                ['/', 'Home'],
                ['/shop', 'Shop Online'],
                ['/products', 'Catalogue'],
                ['/brands', 'Partners'],
                ['/about', 'About Us'],
                ['/news', 'Insights'],
                ['/contact', 'Contact'],
              ].map(([to, label]) => (
                <li key={to}><SiteLink to={to} className="hover:text-brand-ember transition-colors">{label}</SiteLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading text-lg font-semibold mb-4 text-brand-charcoal">Get in touch</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {contact.address && (
                <li className="flex items-start space-x-2">
                  <MapPin size={18} className="text-brand-ember/80 mt-1 flex-shrink-0" />
                  <span className="whitespace-pre-line">{contact.address}</span>
                </li>
              )}
              {[contact.mobilePhone, contact.officePhone].filter(Boolean).map((phone) => (
                <li key={phone} className="flex items-center space-x-2">
                  <Phone size={18} className="text-brand-ember/80 flex-shrink-0" />
                  <a href={telHref(phone)} className="hover:text-brand-ember transition-colors">{phone}</a>
                </li>
              ))}
              {[contact.email, contact.email2].filter(Boolean).map((email) => (
                <li key={email} className="flex items-center space-x-2">
                  <Mail size={18} className="text-brand-ember/80 flex-shrink-0" />
                  <a href={`mailto:${email}`} className="break-all hover:text-brand-ember transition-colors">{email}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading text-lg font-semibold mb-4 text-brand-charcoal">Opening Hours</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {hours.map(({ days, time }) => (
                <li key={days} className="flex items-center space-x-2">
                  <Clock size={18} className="text-brand-ember/80 flex-shrink-0" />
                  <div>
                    <p>{days}</p>
                    <p className="font-medium text-brand-charcoal">{time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-charcoal/10 mt-8 pt-8 flex flex-col items-center gap-4 text-sm text-gray-600 sm:flex-row sm:justify-between sm:pr-20">
          <p className="text-center sm:text-left">&copy; {CURRENT_YEAR} DECODE IT Solutions. All rights reserved.</p>
          <ul className="flex items-center gap-2" aria-label="Social media">
            {social.filter(({ url }) => url).map(({ id, label, url }, index) => (
              <li key={`${id}-${index}`}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`DECODE IT Solutions on ${label}`}
                  title={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-charcoal/5 text-brand-charcoal ring-1 ring-brand-charcoal/10 transition-colors hover:bg-brand-yellow hover:text-brand-charcoal"
                >
                  <SocialIcon name={id} size={15} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
