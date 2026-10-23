import { getSiteSettings, whatsappLink } from './siteSettings'

// A WhatsApp link that opens with the message already typed. The number is the one set in Admin → Settings.
export function whatsappMessageUrl(message) {
  return `${whatsappLink(getSiteSettings())}?text=${encodeURIComponent(message)}`
}
