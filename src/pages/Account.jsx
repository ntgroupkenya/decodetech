import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BadgePercent, Ticket, Truck } from 'lucide-react'
import useAuth from '../auth/useAuth'

const fieldClass = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40'

export default function Account({ mode }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

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
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
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
    <div className="px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-md border border-gray-200 bg-white md:grid-cols-5">
        <form onSubmit={submit} className="space-y-4 p-6 sm:p-8 md:col-span-3">
          <div>
            <p className="code-label">{isSignup ? 'new account' : 'sign in'}</p>
            <h1 className="mt-1 text-2xl font-bold text-brand-charcoal">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          </div>
          {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

          {isSignup && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Full name
                <input required autoComplete="name" className={fieldClass} value={form.name} onChange={set('name')} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Phone number
                <input required type="tel" autoComplete="tel" placeholder="+254 7XX XXX XXX" className={fieldClass} value={form.phone} onChange={set('phone')} />
              </label>
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Username
            <input required autoComplete="username" className={fieldClass} value={form.username} onChange={set('username')} />
            {isSignup && <span className="mt-1 block text-xs font-normal text-gray-500">3–32 letters, numbers, dots, dashes or underscores.</span>}
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Password
            <input
              required
              type="password"
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className={fieldClass}
              value={form.password}
              onChange={set('password')}
            />
            {isSignup && <span className="mt-1 block text-xs font-normal text-gray-500">At least 8 characters.</span>}
          </label>

          <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-primary px-4 py-3 font-semibold text-brand-ink transition-colors hover:bg-brand-teal-light disabled:opacity-50">
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>

          <p className="text-sm text-gray-600">
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <Link to={isSignup ? '/login' : '/signup'} state={location.state} className="font-semibold text-brand-primary-dark hover:underline">
              {isSignup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </form>

        <aside className="grid-backdrop p-6 text-white sm:p-8 md:col-span-2">
          <p className="font-mono text-xs font-bold uppercase tracking-wide text-brand-teal">Members save more</p>
          <p className="mt-2 text-sm text-white/75">Unlock exclusive offers before you send an order on WhatsApp.</p>
          <ul className="mt-6 space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-brand-teal">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
