// The cart is kept in a small cookie (ids and quantities only), so it survives closing the browser for 30 days.
const COOKIE = 'decode_cart'
const MAX_LINES = 12
const MAX_QTY = 999

export const CART_LIMITS = { maxLines: MAX_LINES, maxQty: MAX_QTY }

export function clampQty(value) {
  const n = Math.floor(Number(value))
  return Math.min(MAX_QTY, Math.max(1, Number.isFinite(n) ? n : 1))
}

// "id:qty,id:qty" with each id percent-encoded.
export function encodeCart(items) {
  return items.map(({ id, qty }) => `${encodeURIComponent(id)}:${clampQty(qty)}`).join(',')
}

export function decodeCart(text) {
  if (!text) return []
  const items = []
  for (const part of text.split(',')) {
    const cut = part.lastIndexOf(':')
    if (cut < 1) continue
    let id = ''
    try {
      id = decodeURIComponent(part.slice(0, cut))
    } catch {
      continue
    }
    if (id && !items.some((item) => item.id === id)) items.push({ id, qty: clampQty(part.slice(cut + 1)) })
    if (items.length >= MAX_LINES) break
  }
  return items
}

export function readCart() {
  try {
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE}=`))
    return match ? decodeCart(decodeURIComponent(match.slice(COOKIE.length + 1))) : []
  } catch {
    return []
  }
}

export function writeCart(items) {
  try {
    const secure = window.location.protocol === 'https:' ? '; secure' : ''
    const expires = items.length ? `max-age=${60 * 60 * 24 * 30}` : 'max-age=0'
    document.cookie = `${COOKIE}=${encodeURIComponent(encodeCart(items))}; path=/; ${expires}; samesite=lax${secure}`
  } catch {
    // cookies blocked: the cart still works for this visit
  }
}
