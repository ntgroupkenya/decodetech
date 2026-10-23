import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import CartProvider from './cart/CartProvider.jsx'
import { logicalPath } from './siteHosts'

const app = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

const root = document.getElementById('root')
// On the shop address "/" is the Shop page, which was pre-rendered as "/shop".
const route = logicalPath(window.location.pathname.replace(/\/+$/, '') || '/')
// Pages built by `npm run build` arrive pre-rendered: attach to that HTML instead of redrawing it.
// If the HTML was rendered for a different route (e.g. a fallback page), start clean.
if (root.dataset.route === route) {
  hydrateRoot(root, app)
} else {
  root.innerHTML = ''
  createRoot(root).render(app)
}
