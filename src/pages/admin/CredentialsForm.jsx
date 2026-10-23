import { useState } from 'react'
import { api } from '../../api'
import useAuth from '../../auth/useAuth'
import { Notice } from './Widgets'
import { btnPrimary, inputClass } from './ui'

// Used both for the forced first-sign-in change and from the Settings tab.
export default function CredentialsForm({ forced = false }) {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', username: forced ? '' : user.username, newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setDone(false)
    if (form.newPassword !== form.confirm) {
      setError('The new passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const res = await api('/admin/credentials', {
        method: 'POST',
        body: { currentPassword: form.currentPassword, username: form.username, newPassword: form.newPassword },
      })
      setUser({ ...user, username: res.username, mustChange: false })
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirm: '' }))
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-md bg-white p-8 shadow-lg">
      <div>
        <h2 className="text-xl font-bold text-brand-charcoal">{forced ? 'Set your admin username and password' : 'Admin username and password'}</h2>
        {forced && (
          <p className="mt-1 text-sm text-gray-600">
            You signed in with the default credentials. Choose your own before continuing. This is required.
          </p>
        )}
      </div>
      {error && <Notice>{error}</Notice>}
      {done && <Notice tone="ok">Saved. Use the new details next time you sign in.</Notice>}

      <label className="block text-sm font-medium text-gray-700">
        Current password
        <input type="password" required autoComplete="current-password" className={`${inputClass} mt-1`} value={form.currentPassword} onChange={set('currentPassword')} />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        New username
        <input required autoComplete="username" className={`${inputClass} mt-1`} value={form.username} onChange={set('username')} />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        New password <span className="font-normal text-gray-500">(at least 8 characters)</span>
        <input type="password" required minLength={8} autoComplete="new-password" className={`${inputClass} mt-1`} value={form.newPassword} onChange={set('newPassword')} />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Confirm new password
        <input type="password" required minLength={8} autoComplete="new-password" className={`${inputClass} mt-1`} value={form.confirm} onChange={set('confirm')} />
      </label>
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>{busy ? 'Saving…' : 'Save username and password'}</button>
    </form>
  )
}
