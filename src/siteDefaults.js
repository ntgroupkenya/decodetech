// Plain data and helpers with no imports, so the build script (plain Node) can use them too.
// The business name and the tagline from the logo, used in page titles, the home and About pages and the footer.
export const SITE_NAME = 'DECODE IT Solutions'
export const TAGLINE = 'Computing, made easy'

// Website details the owner edits in Admin → Settings. These defaults show until saved values arrive.
export const DEFAULT_SETTINGS = {
  contact: {
    email: 'info@decodetech.co.ke',
    email2: 'decod3.it@gmail.com',
    address: 'Ridge House, 1st Floor, Stall 4\nMunyu Road off Accra Road, Nairobi',
    whatsapp: '254711294124',
    mobilePhone: '',
    officePhone: '+254 711 294124',
  },
  hours: [
    { days: 'Monday - Saturday', time: '8:00 AM - 6:00 PM' },
    { days: 'Sunday', time: 'Closed' },
  ],
  announcement: { enabled: false, text: '', link: '' },
  social: [
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/decodeitsolutions.ke' },
    { id: 'x', label: 'X', url: 'https://twitter.com/decode_it_kenya' },
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/decode_technologies/' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/decode-technologies-ke' },
  ],
}

export const digitsOnly = (value) => String(value || '').replace(/\D+/g, '')
export function telHref(value) {
  let digits = digitsOnly(value)
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`
  return `tel:+${digits}`
}

// 254711294124 -> +254 711 294124 (other lengths are shown as +digits).
export function displayPhone(value) {
  const digits = digitsOnly(value)
  const kenya = digits.match(/^254(\d{3})(\d{6})$/)
  return kenya ? `+254 ${kenya[1]} ${kenya[2]}` : `+${digits}`
}

export const whatsappLink = (settings) => `https://wa.me/${digitsOnly(settings.contact.whatsapp)}`

