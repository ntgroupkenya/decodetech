import { useState } from 'react'
import { BadgePercent, Pencil, Plus, Ticket, Trash2, Truck } from 'lucide-react'
import { api } from '../../api'
import useLoad from './useLoad'
import { Badge, Empty, Notice } from './Widgets'
import { btnGhost, btnPrimary, btnYellow, inputClass } from './ui'
import { offerLabel } from '../../offerMath'

const TYPES = [
  { value: 'discount', label: 'Member discount', icon: BadgePercent, help: 'Applied automatically as a member price, and offered at checkout.' },
  { value: 'coupon', label: 'Coupon code', icon: Ticket, help: 'Members see the code and can pick or type it at checkout.' },
  { value: 'delivery', label: 'Delivery offer', icon: Truck, help: 'e.g. free delivery in town. Members choose it at checkout.' },
]

const blank = { type: 'discount', title: '', description: '', code: '', percentOff: '', amountOff: '', minPrice: '', category: '', startsOn: '', endsOn: '', active: true }

function OfferForm({ offer, onClose, onSaved }) {
  const isNew = !offer.id
  const [form, setForm] = useState({
    ...blank,
    ...Object.fromEntries(Object.entries(offer).map(([k, v]) => [k, v ?? ''])),
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const type = TYPES.find((t) => t.value === form.type)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (isNew) await api('/admin/offers', { method: 'POST', body: form })
      else await api(`/admin/offers/${offer.id}`, { method: 'PUT', body: form })
      onSaved(isNew ? 'Offer created.' : 'Offer saved.')
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={isNew ? 'New offer' : 'Edit offer'}>
      <form onSubmit={submit} className="my-8 w-full max-w-xl rounded-md bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-4"><h2 className="text-lg font-bold text-brand-charcoal">{isNew ? 'New offer' : 'Edit offer'}</h2></div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {error && <div className="sm:col-span-2"><Notice>{error}</Notice></div>}
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Type
            <select className={`${inputClass} mt-1`} value={form.type} onChange={set('type')}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <span className="mt-1 block text-xs font-normal text-gray-500">{type.help}</span>
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Title *
            <input required className={`${inputClass} mt-1`} value={form.title} onChange={set('title')} placeholder={form.type === 'delivery' ? 'Free delivery in town' : '10% off for members'} />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Details shown to members
            <textarea rows={2} className={`${inputClass} mt-1`} value={form.description} onChange={set('description')} />
          </label>
          {form.type === 'coupon' && (
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">
              Coupon code *
              <input required className={`${inputClass} mt-1 font-mono uppercase`} value={form.code} onChange={set('code')} placeholder="WELCOME500" />
            </label>
          )}
          {form.type !== 'delivery' && (
            <>
              <label className="text-sm font-medium text-gray-700">
                Percent off (%)
                <input type="number" min="0" max="100" step="0.01" className={`${inputClass} mt-1`} value={form.percentOff} onChange={set('percentOff')} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Or amount off (KES)
                <input type="number" min="0" step="0.01" className={`${inputClass} mt-1`} value={form.amountOff} onChange={set('amountOff')} />
                <span className="mt-1 block text-xs font-normal text-gray-500">If both are set, the bigger saving applies.</span>
              </label>
            </>
          )}
          <label className="text-sm font-medium text-gray-700">
            Minimum product price (KES)
            <input type="number" min="0" step="0.01" className={`${inputClass} mt-1`} value={form.minPrice} onChange={set('minPrice')} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Only for category
            <input className={`${inputClass} mt-1`} value={form.category} onChange={set('category')} placeholder="All categories" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Starts on
            <input type="date" className={`${inputClass} mt-1`} value={form.startsOn} onChange={set('startsOn')} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Ends on
            <input type="date" className={`${inputClass} mt-1`} value={form.endsOn} onChange={set('endsOn')} />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" checked={form.active} onChange={set('active')} /> Active
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving…' : 'Save offer'}</button>
        </div>
      </form>
    </div>
  )
}

export default function OffersTab() {
  const { data, error, loading, reload } = useLoad('/admin/offers')
  const [editing, setEditing] = useState(null)
  const [status, setStatus] = useState('')
  const [actionError, setActionError] = useState('')
  const offers = data?.offers ?? []

  const remove = async (offer) => {
    if (!window.confirm(`Delete "${offer.title}"?`)) return
    setActionError('')
    try {
      await api(`/admin/offers/${offer.id}`, { method: 'DELETE' })
      reload()
    } catch (e) {
      setActionError(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-gray-600">
          Offers are visible to signed-in members only. At checkout a member picks one discount <em>or</em> coupon (the cheapest, they don’t stack) and optionally one delivery offer, before the order is sent to WhatsApp.
        </p>
        <button type="button" className={btnYellow} onClick={() => setEditing({})}><Plus size={16} /> New offer</button>
      </div>
      {status && <Notice tone="ok">{status}</Notice>}
      {(error || actionError) && <Notice>{error || actionError}</Notice>}
      {!loading && offers.length === 0 && !error && <Empty>No offers yet. Create a discount, coupon or delivery offer to reward members.</Empty>}

      <ul className="grid gap-3 md:grid-cols-2">
        {offers.map((o) => {
          const meta = TYPES.find((t) => t.value === o.type)
          const Icon = meta.icon
          return (
            <li key={o.id} className={`rounded-md border bg-white p-5 shadow-sm ${o.active ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon size={20} className="mt-0.5 text-brand-charcoal" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-brand-charcoal">{o.title}</p>
                    <p className="text-sm text-gray-600">
                      {meta.label}{offerLabel(o) ? ` · ${offerLabel(o)}` : ''}
                      {o.code && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{o.code}</span>}
                    </p>
                  </div>
                </div>
                <Badge tone={o.active ? 'green' : 'gray'}>{o.active ? 'Active' : 'Off'}</Badge>
              </div>
              {o.description && <p className="mt-2 text-sm text-gray-700">{o.description}</p>}
              <p className="mt-2 text-xs text-gray-500">
                {[o.category && `Category: ${o.category}`, o.minPrice != null && `Min price KES ${o.minPrice.toLocaleString()}`, o.startsOn && `From ${o.startsOn}`, o.endsOn && `Until ${o.endsOn}`].filter(Boolean).join(' · ') || 'All products, no dates'}
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className={btnGhost} onClick={() => setEditing(o)}><Pencil size={14} /> Edit</button>
                <button type="button" className={`${btnGhost} text-red-700`} aria-label={`Delete ${o.title}`} onClick={() => remove(o)}><Trash2 size={14} /></button>
              </div>
            </li>
          )
        })}
      </ul>

      {editing && (
        <OfferForm
          offer={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null)
            setStatus(msg)
            reload()
          }}
        />
      )}
    </div>
  )
}
