import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import WhatsAppWidget from './components/WhatsAppWidget'
import WhatsAppClickTracker from './components/WhatsAppClickTracker'
import CartDrawer from './components/CartDrawer'
import PageMeta from './components/PageMeta'
import Home from './pages/Home'
import About from './pages/About'
import Brands from './pages/Brands'
import Products from './pages/Products'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import HowToOrder from './pages/HowToOrder'
import News from './pages/News'
import NewsPost from './pages/NewsPost'
import AnnouncementBar from './components/AnnouncementBar'
import { hostKind } from './siteHosts'
import CategoryPage from './pages/CategoryPage'
import Account from './pages/Account'
import Admin from './pages/admin/Admin'

function PublicSite() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={hostKind('/') === 'shop' ? <Shop /> : <Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/how-to-order" element={<HowToOrder />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id/:slug?" element={<NewsPost />} />
          <Route path="/product/:id/:slug?" element={<ProductPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/login" element={<Account mode="login" />} />
          <Route path="/signup" element={<Account mode="signup" />} />
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
      <Route path="*" element={<PublicSite />} />
    </Routes>
  )
}

export default App
