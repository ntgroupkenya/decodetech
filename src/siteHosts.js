// The whole site lives on one address: the Shop is "/", products are /product/..., the admin is /admin,
// and the PHP API (/api) and uploaded images (/uploads) are served from the same place.
// Set the domain here, or with VITE_ROOT_DOMAIN when building.
const override = import.meta.env?.VITE_ROOT_DOMAIN || (typeof process !== 'undefined' ? process.env.VITE_ROOT_DOMAIN : '')
export const ROOT_DOMAIN = override || 'example.com'

export const SITE_HOST = `www.${ROOT_DOMAIN}`
export const SITE_URL = `https://${SITE_HOST}`

export const isAdminPath = (path) => path === '/admin' || path.startsWith('/admin/')
