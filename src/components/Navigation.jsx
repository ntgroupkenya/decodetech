import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SiteLink from './SiteLink'
import { Menu, X, Phone, User, ShoppingCart, Mail, Clock } from 'lucide-react'
import useAuth from '../auth/useAuth'
import useCart from '../cart/useCart'
import { displayPhone, useSiteSettings } from '../siteSettings'
import { TAGLINE } from '../siteDefaults'
import { logicalPath } from '../siteHosts'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { contact, hours, whatsappUrl } = useSiteSettings()
  const { user, logout } = useAuth()
  const { count, open: openCart } = useCart()

  const cartButton = (extra = '') => (
    <button
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
      className={`relative rounded-lg p-2 hover:bg-slate-100 ${extra}`}
    >
      <ShoppingCart size={22} aria-hidden="true" />
      {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 text-xs font-bold text-brand-charcoal">{count > 99 ? '99+' : count}</span>}
    </button>
  )
  // Account links only appear on the Shop pages (on the shop address that is its home page).
  const currentPath = logicalPath(useLocation().pathname)
  const showAccount = currentPath.startsWith('/shop')

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Catalogue', path: '/products' },
    { name: 'Partners', path: '/brands' },
    { name: 'Insights', path: '/news' },
    { name: 'Contact', path: '/contact' },
    { name: 'Shop Online', path: '/shop', highlight: true },
  ]

  return (
    <>
    {/* Contact strip above the menu (wide screens only); it scrolls away, the menu stays. */}
    <div className="hidden bg-brand-charcoal text-xs text-blue-100 md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="italic text-brand-yellow">{TAGLINE}</p>
        <div className="flex items-center gap-5">
          {contact.whatsapp && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><Phone size={13} aria-hidden="true" />{displayPhone(contact.whatsapp)}</a>}
          {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail size={13} aria-hidden="true" />{contact.email}</a>}
          {hours[0] && <span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{hours[0].days}: {hours[0].time}</span>}
        </div>
      </div>
    </div>
    <nav className="brand-underline bg-white/95 text-brand-charcoal backdrop-blur sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <SiteLink to="/" className="flex shrink-0 items-center" aria-label="DECODE IT Solutions home">
            <img
              src="/logo.png"
              alt="DECODE IT Solutions"
              className="h-14 w-52 object-contain"
            />
          </SiteLink>

          {/* The full menu needs about 1200px; narrower screens use the menu button. */}
          <div className="hidden xl:flex flex-1 items-center justify-center gap-1 whitespace-nowrap">
            {navLinks.filter((link) => !link.highlight).map((link) => (
              <SiteLink
                key={link.name}
                to={link.path}
                aria-current={currentPath === link.path ? 'page' : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 2xl:px-4 ${
                  currentPath === link.path ? 'bg-brand-charcoal/5 text-brand-ember' : ''
                }`}
              >
                {link.name}
              </SiteLink>
            ))}
          </div>
          <div className="hidden xl:flex items-center gap-3 whitespace-nowrap">
            {navLinks.filter((link) => link.highlight).map((link) => (
              <SiteLink key={link.name} to={link.path} className="rounded-full bg-brand-yellow px-5 py-2 text-sm font-bold text-brand-charcoal transition-colors hover:bg-brand-orange">
                {link.name}
              </SiteLink>
            ))}
            {cartButton()}
            {showAccount && (user ? (
              <div className="flex items-center space-x-3 text-sm">
                <span className="flex items-center gap-1 text-gray-600" title={user.name || user.username}><User size={16} aria-hidden="true" /><span className="hidden 2xl:inline">{user.name.split(' ')[0] || user.username}</span></span>
                {user.role === 'admin' && <SiteLink to="/admin" className="font-medium hover:text-brand-ember">Admin</SiteLink>}
                <button type="button" onClick={logout} className="font-medium hover:text-brand-ember">Log out</button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-sm font-medium">
                <SiteLink to="/login" className="hover:text-brand-ember">Log in</SiteLink>
                <SiteLink to="/signup" className="rounded-lg border border-brand-ember px-3 py-1.5 text-brand-ember hover:bg-brand-yellow hover:text-brand-charcoal">Sign up</SiteLink>
              </div>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center gap-2 rounded-full border-2 border-green-600 px-4 py-1.5 text-green-700 transition-colors hover:bg-green-600 hover:text-white"
            >
              <Phone size={16} />
              <span className={`text-sm font-semibold ${showAccount ? 'hidden 2xl:inline' : ''}`}>WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-1 xl:hidden">
          {cartButton()}
          <button
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <SiteLink
                key={link.name}
                to={link.path}
                className={`block py-2 text-sm font-medium transition-colors hover:text-brand-ember ${
                  link.highlight
                    ? 'bg-brand-yellow text-brand-charcoal px-4 py-2 rounded-lg font-bold text-center'
                    : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </SiteLink>
            ))}
            {showAccount && (user ? (
              <>
                <p className="py-2 text-sm text-gray-600">Signed in as {user.name || user.username}</p>
                {user.role === 'admin' && <SiteLink to="/admin" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Admin</SiteLink>}
                <button type="button" onClick={() => { setIsOpen(false); logout() }} className="block py-2 text-sm font-medium">Log out</button>
              </>
            ) : (
              <div className="flex gap-3 py-2">
                <SiteLink to="/login" className="flex-1 rounded-lg border border-slate-300 py-2 text-center text-sm font-medium" onClick={() => setIsOpen(false)}>Log in</SiteLink>
                <SiteLink to="/signup" className="flex-1 rounded-lg bg-brand-yellow py-2 text-center text-sm font-bold text-brand-charcoal" onClick={() => setIsOpen(false)}>Sign up</SiteLink>
              </div>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone size={18} />
              <span className="text-sm font-medium">WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </nav>
    </>
  )
}
