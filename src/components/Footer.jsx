import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { telHref, useSiteSettings } from '../siteSettings'
import SocialIcon from './SocialIcon'
import CodeMark from './CodeMark'
import { SITE_NAME, TAGLINE } from '../siteDefaults'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { contact, hours, social } = useSiteSettings()
  const phones = [contact.officePhone, contact.mobilePhone].filter(Boolean)
  return (
    <footer className="bg-brand-charcoal text-sm text-white/70">
      <div className="brand-line" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-10 lg:px-8">
        <div>
          <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt={SITE_NAME} className="h-10 w-40 object-contain object-left" />
          <p className="mt-2 font-mono text-xs text-white/80"><CodeMark /> {TAGLINE}</p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-8">
          {contact.address && (
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" />
              <span className="whitespace-pre-line">{contact.address}</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" />
            <span>{hours.map(({ days, time }) => <span key={days} className="block">{days}: <span className="text-white">{time}</span></span>)}</span>
          </li>
          {phones.map((phone) => (
            <li key={phone} className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-brand-teal" aria-hidden="true" />
              <a href={telHref(phone)} className="font-mono hover:text-white">{phone}</a>
            </li>
          ))}
          {[contact.email, contact.email2].filter(Boolean).map((email) => (
            <li key={email} className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-brand-teal" aria-hidden="true" />
              <a href={`mailto:${email}`} className="break-all hover:text-white">{email}</a>
            </li>
          ))}
        </ul>

        <ul className="flex items-center gap-2" aria-label="Social media">
          {social.filter(({ url }) => url).map(({ id, label, url }, index) => (
            <li key={`${id}-${index}`}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE_NAME} on ${label}`}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white ring-1 ring-white/10 transition-colors hover:bg-brand-teal hover:text-brand-ink"
              >
                <SocialIcon name={id} size={16} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-white/50 sm:px-6 sm:pr-24 lg:px-8">&copy; {CURRENT_YEAR} {SITE_NAME}. Prices and availability are confirmed on WhatsApp before you pay.</p>
      </div>
    </footer>
  )
}
