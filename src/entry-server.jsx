import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import CartProvider from './cart/CartProvider.jsx'

// Used only at build time by scripts/prerender.mjs to produce each page's HTML.
// `products` is the catalogue the pages are built from (read by useProducts while rendering); `site` carries the
// owner-edited settings.
export function render(url, products, site = {}) {
  globalThis.__SSR_PRODUCTS__ = products
  globalThis.__SSR_SETTINGS__ = site.settings
  return renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </StaticRouter>,
  )
}
