import { useEffect, useSyncExternalStore } from 'react'
import { api } from './api'
import { DEFAULT_SETTINGS, whatsappLink } from './siteDefaults'

export { DEFAULT_SETTINGS, digitsOnly, displayPhone, telHref, whatsappLink } from './siteDefaults'

// Live copy of the website details (contact, opening hours, announcement, social links) for the whole site.
// Pre-rendered pages carry the settings they were built from (window.__SETTINGS__), so the browser's first
// render matches the HTML. While pre-rendering, the same object arrives as globalThis.__SSR_SETTINGS__.
let preloadedFrom = null
let preloadedValue = DEFAULT_SETTINGS
function preloaded() {
  const saved = typeof window !== 'undefined' ? window.__SETTINGS__ : globalThis.__SSR_SETTINGS__
  if (saved !== preloadedFrom) {
    preloadedFrom = saved
    preloadedValue = saved && typeof saved === 'object' ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS
  }
  return preloadedValue
}

let current = preloaded()
let fetched = false
const listeners = new Set()

export function setSiteSettings(next) {
  current = { ...DEFAULT_SETTINGS, ...next }
  listeners.forEach((fn) => fn())
}
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
// During pre-rendering the settings change per build, so server renders always read them afresh.
const getSnapshot = () => current
const getServerSnapshot = () => preloaded()

export function useSiteSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  useEffect(() => {
    if (fetched) return
    fetched = true
    api('/settings')
      .then((data) => data?.contact && setSiteSettings(data))
      .catch(() => {
        fetched = false
      })
  }, [])
  return { ...settings, whatsappUrl: whatsappLink(settings) }
}

// Plain-function access for code that is not a component (e.g. building a WhatsApp message link).
export const getSiteSettings = () => current
