import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BadgePercent, Ticket, Truck } from 'lucide-react'
import useAuth from '../auth/useAuth'
import { crossHref } from '../siteHosts'

const fieldClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent'

export default function Account({ mode }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/shop'

  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = isSignup ? await signup(form) : await login(form.username, form.password)
      const next = user.role === 'admin' ? '/admin' : from
      const href = crossHref(next)
      // The admin (and the shop, from the main site) live on other addresses: leave the app for those.
      if (/^https?:/.test(href)) window.location.assign(href)
      else navigate(href, { replace: true })
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  const perks = [
    { icon: BadgePercent, text: 'Member discounts on shop prices' },
    { icon: Ticket, text: 'Coupon codes you can use at checkout' },
    { icon: Truck, text: 'Delivery offers on your orders' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-5">
        <aside className="bg-brand-charcoal p-8 text-white md:col-span-2">
          <h1 className="text-2xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm text-gray-300">Members unlock exclusive offers before they send an order on WhatsApp.</p>
          <ul className="mt-6 space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <Icon size={20} className="mt-0.5 shrink-0 text-brand-yellow" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </aside>

        <form onSubmit={submit} className="space-y-4 p-8 md:col-span-3">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

          {isSignup && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Full name
                <input required autoComplete="name" className={`${fieldClass} mt-1`} value={form.name} onChange={set('name')} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Phone number
                <input required type="tel" autoComplete="tel" placeholder="+254 7XX XXX XXX" className={`${fieldClass} mt-1`} value={form.phone} onChange={set('phone')} />
              </label>
            </>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Username
            <input required autoComplete="username" className={`${fieldClass} mt-1`} value={form.username} onChange={set('username')} />
            {isSignup && <span className="mt-1 block text-xs font-normal text-gray-500">3–32 letters, numbers, dots, dashes or underscores.</span>}
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Password
            <input
              required
              type="password"
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className={`${fieldClass} mt-1`}
              value={form.password}
              onChange={set('password')}
            />
            {isSignup && <span className="mt-1 block text-xs font-normal text-gray-500">At least 8 characters.</span>}
          </label>

          <button type="submit" disabled={busy} className="w-full rounded-full bg-brand-yellow px-4 py-3 font-bold text-brand-charcoal transition-colors hover:bg-brand-orange disabled:opacity-50">
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-600">
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <Link to={isSignup ? '/login' : '/signup'} state={location.state} className="font-semibold text-brand-charcoal underline">
              {isSignup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
