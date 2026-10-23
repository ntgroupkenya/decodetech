// The site lives on three addresses, each uploaded to its own folder:
//   https://www.example.com     Home, About, Brands, Products, Contact, product and category pages,
//                                         plus the PHP API, the database connection and uploaded images
//   https://shop.example.com    the Shop (its "/" is the Shop page); login and sign-up work here too
//   https://admin.example.com   the admin (/admin)
// The shop and admin call the API on the www address; one login cookie is shared by all three.
// On any other address (localhost, previews) everything stays on one host.
const override = import.meta.env?.VITE_ROOT_DOMAIN || (typeof process !== 'undefined' ? process.env.VITE_ROOT_DOMAIN : '')
export const ROOT_DOMAIN = override || 'example.com'

export const MAIN_HOST = `www.${ROOT_DOMAIN}`
export const SHOP_HOST = `shop.${ROOT_DOMAIN}`
export const ADMIN_HOST = `admin.${ROOT_DOMAIN}`
export const MAIN_URL = `https://${MAIN_HOST}`
export const SHOP_URL = `https://${SHOP_HOST}`
export const ADMIN_URL = `https://${ADMIN_HOST}`

export const isShopPath = (path) => path === '/shop' || path.startsWith('/shop/')
export const isAdminPath = (path) => path === '/admin' || path.startsWith('/admin/')

// Which host a site path belongs to: 'shop', 'admin', 'main', or 'any' (login and sign-up work on main and shop).
export function targetHost(path) {
  if (isShopPath(path)) return 'shop'
  if (isAdminPath(path)) return 'admin'
  if (path === '/login' || path === '/signup') return 'any'
  return 'main'
}

// The host the current page is served from: 'main', 'shop', 'admin', or null when it is none of them (localhost, previews).
// While pre-rendering (no window) the host follows from the page's route.
export function hostKind(pathname) {
  if (typeof window === 'undefined') {
    if (!globalThis.__SSR_SITE__) return null
    return isShopPath(pathname) ? 'shop' : 'main'
  }
  const host = window.location.hostname
  if (host === SHOP_HOST) return 'shop'
  if (host === ADMIN_HOST) return 'admin'
  if (host === MAIN_HOST || host === ROOT_DOMAIN) return 'main'
  return null
}

// On the shop host "/" is the Shop page, so "/" counts as "/shop" for titles, canonical links and menus.
export function logicalPath(pathname) {
  return pathname === '/' && hostKind(pathname) === 'shop' ? '/shop' : pathname
}

// Full address of a site path on the host it belongs to.
export function siteHref(host, path) {
  if (host === 'shop') return `${SHOP_URL}${path === '/shop' ? '/' : path}`
  if (host === 'admin') return `${ADMIN_URL}${path}`
  return `${MAIN_URL}${path}`
}

// A plain href for `path` as seen from the current page: a full address when it lives on another of the
// three hosts, otherwise the path itself (so localhost keeps working).
export function crossHref(path, pathname = typeof window === 'undefined' ? '/' : window.location.pathname) {
  const here = hostKind(pathname)
  const target = targetHost(path)
  if (here && target !== 'any' && target !== here) return siteHref(target, path)
  if (here === 'admin' && target === 'any') return siteHref('main', path)
  return here === 'shop' && path === '/shop' ? '/' : path
}

// Where the PHP API lives: same origin on the main site and locally, the www address from the shop and admin.
export function apiOrigin() {
  if (typeof window === 'undefined') return ''
  const here = hostKind(window.location.pathname)
  return here === 'shop' || here === 'admin' ? MAIN_URL : ''
}
