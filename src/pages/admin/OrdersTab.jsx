import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '../../api'
import useLoad from './useLoad'
import { Badge, Empty, Notice } from './Widgets'
import { btnGhost, formatDate, inputClass } from './ui'

const STATUSES = [
  { value: 'pending', label: 'Pending', tone: 'amber' },
  { value: 'dispatched', label: 'Dispatched', tone: 'green' },
  { value: 'not_dispatched', label: 'Not dispatched', tone: 'red' },
  { value: 'cancelled', label: 'Cancelled', tone: 'gray' },
]

function OrderCard({ order, onSaved, onError }) {
  const [form, setForm] = useState({
    status: order.status,
    note: order.note || '',
    customerName: order.customer_name || '',
    customerPhone: order.customer_phone || '',
  })
  const [busy, setBusy] = useState(false)
  const dirty =
    form.status !== order.status ||
    form.note !== (order.note || '') ||
    form.customerName !== (order.customer_name || '') ||
    form.customerPhone !== (order.customer_phone || '')
  const tone = STATUSES.find((s) => s.value === order.status)?.tone

  const save = async (patch = {}) => {
    setBusy(true)
    onError('')
    try {
      await api(`/admin/orders/${order.id}`, { method: 'PATCH', body: { ...form, ...patch } })
      onSaved()
    } catch (e) {
      onError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-charcoal">{order.product_name}</p>
          <p className="text-sm text-gray-600">Order #{order.id} · clicked {formatDate(order.created_at)}{order.user_id ? ' · member account' : ' · guest'}{order.cart_ref ? ` · cart ${order.cart_ref}` : ''}</p>
        </div>
        <Badge tone={tone}>{STATUSES.find((s) => s.value === order.status)?.label}</Badge>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-medium text-gray-700">Quantity</dt>
        <dd className="text-brand-charcoal"><strong>{order.quantity ?? 1}</strong></dd>
        <dt className="font-medium text-gray-700">Deliver to</dt>
        <dd className="whitespace-pre-wrap">{order.delivery_address || <span className="text-gray-500">Not given. Confirm on WhatsApp.</span>}</dd>
      </dl>

      {order.offers_applied && (
        <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          <p className="font-semibold">Member offers applied{order.final_price != null ? `: KES ${Number(order.final_price).toLocaleString()} each${(order.quantity ?? 1) > 1 ? `, KES ${(Number(order.final_price) * order.quantity).toLocaleString()} for ${order.quantity}` : ''}` : ''}</p>
          <p className="whitespace-pre-wrap">{order.offers_applied}</p>
        </div>
      )}

      {order.message && (
        <details className="mt-2 text-sm text-gray-600">
          <summary className="cursor-pointer text-gray-500">WhatsApp message sent</summary>
          <p className="mt-1 whitespace-pre-wrap">{order.message}</p>
        </details>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">
          Customer name
          <input className={`${inputClass} mt-1`} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Customer phone
          <input className={`${inputClass} mt-1`} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        </label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
          Note (payment, courier, reason not dispatched…)
          <input className={`${inputClass} mt-1`} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Did this order go out?</span>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={busy}
            aria-pressed={form.status === s.value}
            onClick={() => {
              setForm({ ...form, status: s.value })
              save({ status: s.value })
            }}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${form.status === s.value ? 'border-brand-primary bg-brand-primary text-brand-ink' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {s.label}
          </button>
        ))}
        <span className="flex-1" />
        {dirty && (
          <button type="button" disabled={busy} className={`${btnGhost} border-brand-teal`} onClick={() => save()}>
            Save changes
          </button>
        )}
        <button
          type="button"
          className={`${btnGhost} text-red-700`}
          aria-label={`Delete order ${order.id}`}
          onClick={async () => {
            if (!window.confirm('Delete this order record?')) return
            try {
              await api(`/admin/orders/${order.id}`, { method: 'DELETE' })
              onSaved()
            } catch (e) {
              onError(e.message)
            }
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  )
}

export default function OrdersTab() {
  const { data, error, loading, reload } = useLoad('/admin/orders')
  const [filter, setFilter] = useState('all')
  const [actionError, setActionError] = useState('')

  const orders = useMemo(() => data?.orders ?? [], [data])
  const counts = useMemo(() => {
    const c = { all: orders.length }
    STATUSES.forEach((s) => { c[s.value] = orders.filter((o) => o.status === s.value).length })
    return c
  }, [orders])
  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="space-y-4">
      <Notice tone="info">
        An order is logged when a visitor presses <strong>Order via WhatsApp</strong>. Their payment and delivery are arranged in WhatsApp, which this site cannot see,
        so record here whether each order was actually dispatched.
      </Notice>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter orders">
        {[{ value: 'all', label: 'All' }, ...STATUSES].map((s) => (
          <button
            key={s.value}
            type="button"
            aria-pressed={filter === s.value}
            onClick={() => setFilter(s.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${filter === s.value ? 'bg-brand-teal text-brand-charcoal' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {s.label} ({counts[s.value] ?? 0})
          </button>
        ))}
      </div>

      {(error || actionError) && <Notice>{error || actionError}</Notice>}
      {!loading && shown.length === 0 && !error && <Empty>No orders in this view.</Empty>}

      <ul className="space-y-3">
        {shown.map((o) => (
          <OrderCard key={`${o.id}-${o.updated_at}`} order={o} onSaved={reload} onError={setActionError} />
        ))}
      </ul>
    </div>
  )
}
