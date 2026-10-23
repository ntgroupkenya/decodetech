import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { api } from '../../api'
import useLoad from './useLoad'
import { Badge, Empty, Notice } from './Widgets'
import { btnGhost, formatDate } from './ui'

export default function MessagesTab() {
  const { data, error, loading, reload } = useLoad('/admin/messages')
  const [actionError, setActionError] = useState('')

  const act = async (fn) => {
    setActionError('')
    try {
      await fn()
      reload()
    } catch (e) {
      setActionError(e.message)
    }
  }

  const messages = data?.messages ?? []

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Contact form submissions from the website. Every submission is also opened in WhatsApp for the visitor to send.</p>
      {(error || actionError) && <Notice>{error || actionError}</Notice>}
      {!loading && messages.length === 0 && !error && <Empty>No messages yet.</Empty>}

      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={`rounded-xl border bg-white p-5 shadow-sm ${m.handled === '1' || m.handled === 1 ? 'border-gray-200 opacity-75' : 'border-brand-yellow'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-charcoal">{m.name}</p>
                <p className="text-sm text-gray-600">
                  <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a> · {formatDate(m.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {Number(m.handled) ? <Badge tone="green">Handled</Badge> : <Badge tone="amber">New</Badge>}
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => act(() => api(`/admin/messages/${m.id}`, { method: 'PATCH', body: { handled: !Number(m.handled) } }))}
                >
                  <Check size={14} /> {Number(m.handled) ? 'Mark new' : 'Mark handled'}
                </button>
                <button
                  type="button"
                  className={`${btnGhost} text-red-700`}
                  aria-label={`Delete message from ${m.name}`}
                  onClick={() => window.confirm('Delete this message?') && act(() => api(`/admin/messages/${m.id}`, { method: 'DELETE' }))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {m.product && (<><dt className="sr-only">Product</dt><dd><span className="text-gray-500">Product:</span> {m.product}</dd></>)}
              {m.budget && (<><dt className="sr-only">Budget</dt><dd><span className="text-gray-500">Budget:</span> {m.budget}</dd></>)}
            </dl>
            {m.message && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{m.message}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
