import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, Boxes, ExternalLink, LayoutDashboard, LogOut, MousePointerClick, PackageCheck, Settings, Users } from 'lucide-react'
import useAuth from '../../auth/useAuth'
import { applyPageMeta } from '../../pageMeta'
import { btnPrimary, inputClass } from './ui'
import { Notice } from './Widgets'
import Dashboard from './Dashboard'
import ProductsTab from './ProductsTab'
import ClicksTab from './ClicksTab'
import OrdersTab from './OrdersTab'
import OffersTab from './OffersTab'
import CustomersTab from './CustomersTab'
import CredentialsForm from './CredentialsForm'
import SettingsTab from './SettingsTab'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Shop', icon: Boxes },
  { id: 'offers', label: 'Offers', icon: BadgePercent },
  { id: 'orders', label: 'Orders', icon: PackageCheck },
  { id: 'clicks', label: 'Clicks', icon: MousePointerClick },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function Screen({ children }) {
  return (
    <div className="grid-backdrop flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <img src="/logo-white.png" alt="DECODE IT Solutions" className="h-12 w-48 object-contain" />
      {children}
    </div>
  )
}

function AdminLogin() {
  const { login, logout } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(form.username, form.password)
      if (user.role !== 'admin') {
        await logout()
        setError('That account is not an administrator.')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-md bg-white p-8 shadow-2xl">
        <div>
          <p className="code-label">admin</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-charcoal">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage products, offers and orders.</p>
        </div>
        {error && <Notice>{error}</Notice>}
        <label className="block text-sm font-medium text-gray-700">
          Username
          <input required autoFocus autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} mt-1`} />
        </label>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-xs text-gray-500"><Link to="/" className="underline">Back to the shop</Link></p>
      </form>
    </Screen>
  )
}

export default function Admin() {
  const { user, ready, logout, setUser } = useAuth()
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    applyPageMeta({ title: 'DECODE Admin', noindex: true })
  }, [])

  // An admin API call that comes back 401 means the session expired.
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('decode-admin-logout', onLogout)
    return () => window.removeEventListener('decode-admin-logout', onLogout)
  }, [setUser])

  if (!ready) return <Screen><p className="text-gray-300">Loading…</p></Screen>
  if (!user) return <AdminLogin />

  if (user.role !== 'admin') {
    return (
      <Screen>
        <div className="w-full max-w-sm space-y-4 rounded-md bg-white p-8 text-center shadow-2xl">
          <h1 className="text-xl font-bold text-brand-charcoal">Admins only</h1>
          <p className="text-sm text-gray-600">You are signed in as {user.name || user.username}, which is a customer account.</p>
          <div className="flex justify-center gap-3">
            <Link to="/" className={btnPrimary}>Back to shop</Link>
            <button type="button" onClick={logout} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">Sign out</button>
          </div>
        </div>
      </Screen>
    )
  }

  if (user.mustChange) return <Screen><CredentialsForm forced /></Screen>

  const current = TABS.find((t) => t.id === tab)

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar on large screens; a top bar with a sideways-scrolling menu on phones and tablets */}
      <aside className="bg-brand-black text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:py-6">
          <div>
            <img src="/logo-white.png" alt="DECODE IT Solutions" className="h-9 w-36 object-contain object-left" />
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wider text-brand-yellow">{'</>'} admin</p>
          </div>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 lg:hidden">
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-white/10 px-2 py-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:py-4" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === id ? 'bg-white/10 text-white shadow-[inset_3px_0_0_var(--color-brand-yellow)]' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={16} className={tab === id ? 'text-brand-yellow' : ''} /> {label}
            </button>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-3 lg:block">
          <p className="truncate px-3 pb-2 text-xs text-white/50">Signed in as <span className="text-white/80">{user.username}</span></p>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-60">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <h1 className="text-xl font-bold text-brand-charcoal">{current?.label}</h1>
            <Link to="/" target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline">
              View shop <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {tab === 'overview' && <Dashboard goTo={setTab} />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'offers' && <OffersTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'clicks' && <ClicksTab />}
          {tab === 'customers' && <CustomersTab />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  )
}
