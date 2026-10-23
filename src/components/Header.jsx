import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, LayoutGrid, LogOut, MessageCircle, Search, Shield, User, X } from 'lucide-react'
import useAuth from '../auth/useAuth'
import useCart from '../cart/useCart'
import CartMark from './CartMark'
import useProducts from '../useProducts'
import { groupCategories } from '../categories'
import { displayPhone, useSiteSettings } from '../siteSettings'

// Signed out: links to log in and sign up. Signed in: the name, with a small menu (admin link, log out).
function AccountMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => !box.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) {
    return (
      <Link to="/login" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white">
        <User size={20} aria-hidden="true" />
        <span className="hidden leading-tight lg:block">
          <span className="block text-[11px] text-white/60">Hello, sign in</span>
          <span className="block font-semibold">Account</span>
        </span>
        <span className="sr-only lg:hidden">Log in or sign up</span>
      </Link>
    )
  }

  const first = (user.name || '').split(' ')[0] || user.username
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white"
      >
        <User size={20} aria-hidden="true" />
        <span className="hidden leading-tight lg:block text-left">
          <span className="block text-[11px] text-white/60">Hello, {first}</span>
          <span className="block font-semibold">Account</span>
        </span>
        <span className="sr-only lg:hidden">Account menu for {first}</span>
        <ChevronDown size={14} className="hidden lg:block" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white text-sm text-gray-800 shadow-xl">
          <p className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500">Signed in as <strong className="block truncate text-sm text-brand-charcoal">{user.name || user.username}</strong></p>
          {user.role === 'admin' && (
            <Link role="menuitem" to="/admin" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50" onClick={() => setOpen(false)}>
              <Shield size={16} aria-hidden="true" /> Admin
            </Link>
          )}
          <button role="menuitem" type="button" onClick={() => { setOpen(false); logout() }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50">
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

// The search box drives the Shop's ?q= filter. On the Shop it filters as you type; elsewhere it opens the Shop on submit.
function SearchBox({ className = '' }) {
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const onShop = pathname === '/'
  const [draft, setDraft] = useState('')
  const value = onShop ? params.get('q') || '' : draft

  const change = (text) => {
    if (!onShop) return setDraft(text)
    const next = new URLSearchParams(params)
    if (text) next.set('q', text)
    else next.delete('q')
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const submit = (event) => {
    event.preventDefault()
    if (onShop) document.getElementById('shop-products')?.scrollIntoView({ block: 'start' })
    else navigate(value.trim() ? `/?q=${encodeURIComponent(value.trim())}` : '/')
  }

  return (
    <form role="search" onSubmit={submit} className={`flex h-11 overflow-hidden rounded-md bg-white ring-2 ring-transparent focus-within:ring-brand-teal ${className}`}>
      <input
        type="search"
        value={value}
        onChange={(e) => change(e.target.value)}
        placeholder="Search laptops, brands, accessories…"
        aria-label="Search products or brands"
        className="min-w-0 flex-1 px-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => change('')} aria-label="Clear search" className="px-2 text-gray-400 hover:text-gray-700">
          <X size={18} />
        </button>
      )}
      <button type="submit" aria-label="Search" className="flex w-12 items-center justify-center bg-brand-teal text-brand-ink transition-colors hover:bg-brand-teal-light">
        <Search size={20} aria-hidden="true" />
      </button>
    </form>
  )
}

// The category bar: the biggest categories, then "More categories" with the full list (38 do not fit on one line).
const BAR_SIZE = 6

function CategoryBar({ categories, active, hours }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const shown = categories.slice(0, BAR_SIZE)
  const activeInMore = active && !shown.some((c) => c.slug === active)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => !box.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const tab = (isActive) => `shrink-0 border-b-2 px-3 py-2.5 transition-colors ${isActive ? 'border-white font-semibold text-white' : 'border-transparent text-white/90 hover:border-white/50 hover:text-white'}`

  return (
    <nav aria-label="Shop categories" className="hidden border-t border-white/10 bg-brand-primary md:block">
      <div className="mx-auto flex max-w-7xl items-center px-4 text-sm sm:px-6 lg:px-8">
        <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
          {[{ slug: '', name: 'All products' }, ...shown].map(({ slug, name }, index) => (
            // Tablets show the first four; the rest are in "More categories".
            <Link key={slug || 'all'} to={slug ? `/?cat=${slug}` : '/'} aria-current={active === slug ? 'page' : undefined} className={`${tab(active === slug)} ${index > 4 ? 'hidden lg:block' : ''}`}>
              {name}
            </Link>
          ))}
        </div>
        {categories.length > BAR_SIZE && (
          <div ref={box} className="relative shrink-0">
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={`flex items-center gap-1.5 ${tab(activeInMore)}`}>
              <LayoutGrid size={15} aria-hidden="true" />
              {activeInMore ? categories.find((c) => c.slug === active)?.name : 'More categories'}
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {open && (
              <div className="absolute right-0 z-50 mt-px w-[min(40rem,calc(100vw-2rem))] rounded-b-md border border-gray-200 bg-white p-3 text-gray-800 shadow-xl">
                <ul className="grid max-h-[65vh] grid-cols-2 gap-x-4 overflow-y-auto lg:grid-cols-3">
                  {categories.map(({ slug, name, products }) => (
                    <li key={slug}>
                      <Link
                        to={`/?cat=${slug}`}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 ${active === slug ? 'bg-brand-primary font-semibold text-white' : 'hover:bg-gray-100'}`}
                      >
                        <span className="truncate">{name}</span>
                        <span className={`font-mono text-xs ${active === slug ? 'text-white/80' : 'text-gray-400'}`}>{products.length}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {hours[0] && <span className="ml-auto hidden shrink-0 pl-4 font-mono text-[11px] text-white/50 lg:block">{hours[0].days}: {hours[0].time}</span>}
      </div>
    </nav>
  )
}

export default function Header() {
  const { contact, hours, whatsappUrl } = useSiteSettings()
  const { count, open: openCart } = useCart()
  const products = useProducts()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const categories = groupCategories(products.filter((p) => p.inShop !== false))
  const activeCategory = pathname === '/' ? params.get('cat') || '' : null

  return (
    <header className="sticky top-0 z-50 bg-brand-charcoal text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="DECODE IT Solutions shop home">
          <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="DECODE IT Solutions" className="h-10 w-36 object-contain object-left sm:h-11 sm:w-44" />
        </Link>

        <SearchBox className="hidden flex-1 md:flex" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-md px-2 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white xl:flex"
          >
            <MessageCircle size={20} className="text-green-400" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block text-[11px] text-white/60">WhatsApp us</span>
              <span className="block font-mono text-xs font-bold">{displayPhone(contact.whatsapp)}</span>
            </span>
          </a>
          <AccountMenu />
          <button
            type="button"
            onClick={openCart}
            aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
            className="relative flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <span className="relative">
              <CartMark size={30} />
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-teal px-1 font-mono text-[11px] font-bold text-brand-ink">
                {count > 99 ? '99+' : count}
              </span>
            </span>
            <span className="hidden lg:inline">Cart</span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-6 md:hidden">
        <SearchBox />
      </div>

      {categories.length > 0 && <CategoryBar categories={categories} active={activeCategory} hours={hours} />}
      <div className="brand-line" aria-hidden="true" />
    </header>
  )
}
