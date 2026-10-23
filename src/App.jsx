import { Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppWidget from './components/WhatsAppWidget'
import WhatsAppClickTracker from './components/WhatsAppClickTracker'
import CartDrawer from './components/CartDrawer'
import PageMeta from './components/PageMeta'
import AnnouncementBar from './components/AnnouncementBar'
import Shop from './pages/Shop'
import Categories from './pages/Categories'
import ProductPage from './pages/ProductPage'
import Account from './pages/Account'
import Admin from './pages/admin/Admin'

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-brand-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-charcoal">This page is not in the shop</h1>
      <p className="mt-3 text-gray-600">It may have moved. Everything we sell is on the shop page.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-brand-primary px-5 py-3 font-semibold text-white hover:bg-brand-primary-dark">Go to the shop</Link>
    </div>
  )
}

function Storefront() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/product/:id/:slug?" element={<ProductPage />} />
          <Route path="/login" element={<Account mode="login" />} />
          <Route path="/signup" element={<Account mode="signup" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppWidget />
      <CartDrawer />
      <WhatsAppClickTracker />
      <PageMeta />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Admin />} />
      <Route path="*" element={<Storefront />} />
    </Routes>
  )
}

export default App
