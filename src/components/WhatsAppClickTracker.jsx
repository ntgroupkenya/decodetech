import { useEffect } from 'react'
import { trackWhatsApp } from '../api'

// Logs every click on a wa.me link anywhere on the public site (nav, widget, banners).
// Buttons that open WhatsApp programmatically (shop, contact form) log themselves with more detail.
export default function WhatsAppClickTracker() {
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href*="wa.me/"]') : null
      if (!link) return
      let message = ''
      try {
        message = new URL(link.href).searchParams.get('text') || ''
      } catch {
        // ignore malformed URLs
      }
      trackWhatsApp({ label: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120), message })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
