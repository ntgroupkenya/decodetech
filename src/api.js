import { apiOrigin, logicalPath } from './siteHosts'

// Base URL of the PHP API. Empty = same origin (Vite proxies /api in dev); the shop and admin addresses use the www site.
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const apiUrl = (path) => `${API_BASE || apiOrigin()}${path}`

// Uploaded images come back as /uploads/... and live on the API server
// (the shop and admin addresses redirect /uploads/ to the www site, so the same path works everywhere).
export function assetUrl(src) {
  if (!src) return src
  return src.startsWith('/uploads/') ? `${API_BASE}${src}` : src
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  let payload
  if (form) {
    payload = form
    headers['X-Requested-With'] = 'fetch'
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  if (method === 'DELETE') headers['X-Requested-With'] = 'fetch'

  const res = await fetch(apiUrl(`/api${path}`), { method, headers, body: payload, credentials: 'include' })
  let data = null
  try {
    data = await res.json()
  } catch {
    // non-JSON response (e.g. server down behind a proxy)
  }
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`)
    error.status = res.status
    throw error
  }
  return data
}

// Fire-and-forget logging that must never break the public site.
function post(path, body) {
  try {
    fetch(apiUrl(`/api${path}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'include',
    }).catch(() => {})
  } catch {
    // ignore
  }
}

export function trackWhatsApp({ label = '', productId = '', message = '' } = {}) {
  post('/track', { type: 'whatsapp_click', label, productId, message, page: logicalPath(window.location.pathname) })
}

// A shopper opened a product's photo: counts toward "most clicked".
export function trackProductClick({ productId, label = '' }) {
  post('/track', { type: 'product_click', label, productId, page: logicalPath(window.location.pathname) })
}

export function recordOrder({ productId, productName, message, offerIds = [], quantity = 1, deliveryAddress = '', cartRef = '' }) {
  post('/orders', { productId, productName, message, offerIds, quantity, deliveryAddress, cartRef })
}

export function recordMessage(data) {
  post('/messages', data)
}
