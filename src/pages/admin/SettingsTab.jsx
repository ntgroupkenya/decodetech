import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../../api'
import { DEFAULT_SETTINGS } from '../../siteDefaults'
import { setSiteSettings } from '../../siteSettings'
import { Notice } from './Widgets'
import { btnGhost, btnYellow, inputClass } from './ui'
import CredentialsForm from './CredentialsForm'

const platforms = ['facebook', 'x', 'linkedin', 'tiktok', 'instagram', 'youtube', 'whatsapp', 'link']
const clone = (value) => JSON.parse(JSON.stringify(value))

export default function SettingsTab() {
  const [form, setForm] = useState(() => clone(DEFAULT_SETTINGS))
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    api('/settings')
      .then((data) => { if (active) setForm({ ...clone(DEFAULT_SETTINGS), ...data, contact: { ...DEFAULT_SETTINGS.contact, ...data.contact }, announcement: { ...DEFAULT_SETTINGS.announcement, ...data.announcement } }) })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const update = (section, key, value) => {
    setSaved(false)
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }))
  }
  const updateRow = (section, index, key, value) => {
    setSaved(false)
    setForm((current) => ({ ...current, [section]: current[section].map((row, i) => i === index ? { ...row, [key]: value } : row) }))
  }
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const result = await api('/admin/settings', { method: 'PUT', body: form })
      setForm(result)
      setSiteSettings(result)
      setSaved(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <CredentialsForm />
      <form onSubmit={submit} className="max-w-4xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal">Website details</h2>
          <p className="mt-1 text-sm text-gray-600">These details appear across the public website and in customer contact links.</p>
        </div>
        {error && <Notice>{error}</Notice>}
        {saved && <Notice tone="ok">Website settings saved.</Notice>}
        {loading ? <p className="text-sm text-gray-500">Loading website settings…</p> : <>
          <section className="space-y-4">
            <h3 className="font-semibold text-brand-charcoal">Contact information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">Main email<input type="email" required className={`${inputClass} mt-1`} value={form.contact.email} onChange={(e) => update('contact', 'email', e.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">Additional email<input type="email" className={`${inputClass} mt-1`} value={form.contact.email2} onChange={(e) => update('contact', 'email2', e.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">WhatsApp number (include country code)<input type="tel" required className={`${inputClass} mt-1`} value={form.contact.whatsapp} onChange={(e) => update('contact', 'whatsapp', e.target.value)} /><span className="mt-1 block text-xs font-normal text-gray-500">For Kenya, use 254 followed by the number, e.g. 254700000000.</span></label>
              <label className="text-sm font-medium text-gray-700">Mobile phone<input type="tel" className={`${inputClass} mt-1`} value={form.contact.mobilePhone} onChange={(e) => update('contact', 'mobilePhone', e.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700">Office phone<input type="tel" className={`${inputClass} mt-1`} value={form.contact.officePhone} onChange={(e) => update('contact', 'officePhone', e.target.value)} /></label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">Address<textarea rows={3} className={`${inputClass} mt-1`} value={form.contact.address} onChange={(e) => update('contact', 'address', e.target.value)} /></label>
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-brand-charcoal">Opening hours</h3><p className="text-xs text-gray-500">Add up to 8 rows.</p></div><button type="button" className={btnGhost} disabled={form.hours.length >= 8} onClick={() => { setSaved(false); setForm((f) => ({ ...f, hours: [...f.hours, { days: '', time: '' }] })) }}><Plus size={15} /> Add hours</button></div>
            {form.hours.map((row, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-medium text-gray-600">Days<input className={`${inputClass} mt-1`} value={row.days} onChange={(e) => updateRow('hours', index, 'days', e.target.value)} placeholder="Monday - Friday" /></label><label className="text-xs font-medium text-gray-600">Hours<input className={`${inputClass} mt-1`} value={row.time} onChange={(e) => updateRow('hours', index, 'time', e.target.value)} placeholder="8:00 AM - 5:00 PM" /></label><button type="button" className={`${btnGhost} self-end text-red-700`} aria-label="Remove opening hours row" onClick={() => { setSaved(false); setForm((f) => ({ ...f, hours: f.hours.filter((_, i) => i !== index) })) }}><Trash2 size={15} /></button></div>)}
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-5">
            <h3 className="font-semibold text-brand-charcoal">Announcement bar</h3>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.announcement.enabled} onChange={(e) => update('announcement', 'enabled', e.target.checked)} /> Show announcement across the site</label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700 sm:col-span-2">Message<input maxLength={200} className={`${inputClass} mt-1`} value={form.announcement.text} onChange={(e) => update('announcement', 'text', e.target.value)} /></label><label className="text-sm font-medium text-gray-700 sm:col-span-2">Optional link<input className={`${inputClass} mt-1`} value={form.announcement.link} onChange={(e) => update('announcement', 'link', e.target.value)} placeholder="/shop or https://example.com" /><span className="mt-1 block text-xs font-normal text-gray-500">Use a site path beginning with / or a full http/https address.</span></label></div>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-brand-charcoal">Social links</h3><p className="text-xs text-gray-500">Only links with a URL are shown on the site.</p></div><button type="button" className={btnGhost} disabled={form.social.length >= 12} onClick={() => { setSaved(false); setForm((f) => ({ ...f, social: [...f.social, { id: 'link', label: '', url: '' }] })) }}><Plus size={15} /> Add link</button></div>
            {form.social.map((row, index) => <div key={index} className="grid gap-2 sm:grid-cols-[150px_1fr_1fr_auto]"><label className="text-xs font-medium text-gray-600">Platform<select className={`${inputClass} mt-1`} value={row.id} onChange={(e) => updateRow('social', index, 'id', e.target.value)}>{platforms.map((platform) => <option key={platform} value={platform}>{platform === 'x' ? 'X' : platform[0].toUpperCase() + platform.slice(1)}</option>)}</select></label><label className="text-xs font-medium text-gray-600">Display name<input className={`${inputClass} mt-1`} value={row.label} onChange={(e) => updateRow('social', index, 'label', e.target.value)} /></label><label className="text-xs font-medium text-gray-600">URL<input type="url" className={`${inputClass} mt-1`} value={row.url} onChange={(e) => updateRow('social', index, 'url', e.target.value)} placeholder="https://…" /></label><button type="button" className={`${btnGhost} self-end text-red-700`} aria-label="Remove social link" onClick={() => { setSaved(false); setForm((f) => ({ ...f, social: f.social.filter((_, i) => i !== index) })) }}><Trash2 size={15} /></button></div>)}
          </section>
          <div className="border-t border-gray-200 pt-5"><button type="submit" className={btnYellow} disabled={busy || loading}>{busy ? 'Saving…' : 'Save website details'}</button></div>
        </>}
      </form>
    </div>
  )
}
