import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import CartProvider from './cart/CartProvider.jsx'

const app = (
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

const root = document.getElementById('root')
const route = window.location.pathname.replace(/\/+$/, '') || '/'
// Pages built by `npm run build` arrive pre-rendered: attach to that HTML instead of redrawing it.
// If the HTML was rendered for a different route (e.g. a fallback page), or the address carries Shop filters
// (?q=, ?cat=...) that the pre-rendered page does not show, start clean.
if (root.dataset.route === route && !window.location.search) {
  hydrateRoot(root, app)
} else {
  root.innerHTML = ''
  createRoot(root).render(app)
}
