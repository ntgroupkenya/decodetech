import { useEffect, useState } from 'react'
import { BadgePercent, Boxes, Inbox, LayoutDashboard, LogOut, MousePointerClick, PackageCheck, Settings, Users } from 'lucide-react'
import useAuth from '../../auth/useAuth'
import { applyPageMeta } from '../../pageMeta'
import { crossHref } from '../../siteHosts'
import { btnPrimary, inputClass } from './ui'
import { Notice } from './Widgets'
import Dashboard from './Dashboard'
import ProductsTab from './ProductsTab'
import MessagesTab from './MessagesTab'
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
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'clicks', label: 'Clicks', icon: MousePointerClick },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function Screen({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-brand-black px-4 py-10">{children}</div>
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
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">DECODE Admin</h1>
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
        <p className="text-center text-xs text-gray-500"><a href={crossHref('/')} className="underline">Back to site</a></p>
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
        <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl">
          <h1 className="text-xl font-bold text-brand-charcoal">Admins only</h1>
          <p className="text-sm text-gray-600">You are signed in as {user.name || user.username}, which is a customer account.</p>
          <div className="flex justify-center gap-3">
            <a href={crossHref('/shop')} className={btnPrimary}>Back to shop</a>
            <button type="button" onClick={logout} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">Sign out</button>
          </div>
        </div>
      </Screen>
    )
  }

  if (user.mustChange) return <Screen><CredentialsForm forced /></Screen>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">DECODE <span className="text-brand-yellow">Admin</span></span>
            <a href={crossHref('/')} className="text-xs text-gray-300 hover:text-white">View site ↗</a>
          </div>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab === id ? 'border-brand-yellow text-brand-yellow' : 'border-transparent text-gray-300 hover:text-white'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {tab === 'overview' && <Dashboard goTo={setTab} />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'offers' && <OffersTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'messages' && <MessagesTab />}
        {tab === 'clicks' && <ClicksTab />}
        {tab === 'customers' && <CustomersTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}

