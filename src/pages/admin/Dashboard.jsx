import useLoad from './useLoad'
import { Notice } from './Widgets'

export default function Dashboard({ goTo }) {
  const { data, error, loading } = useLoad('/admin/stats')

  if (error) return <Notice>{error}</Notice>
  if (loading && !data) return <p className="text-gray-500">Loading…</p>

  const cards = [
    { label: 'Products', value: data.products, tab: 'products' },
    { label: 'Customer accounts', value: data.customers, tab: 'customers' },
    { label: 'Unhandled messages', value: data.unreadMessages, tab: 'messages' },
    { label: 'WhatsApp clicks (7 days)', value: data.clicks7, tab: 'clicks' },
    { label: 'Orders awaiting a decision', value: data.pendingOrders, tab: 'orders' },
    { label: 'Orders dispatched', value: data.dispatchedOrders, tab: 'orders' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => goTo(card.tab)}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-yellow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-brand-charcoal">{card.value}</p>
            <p className="mt-1 text-sm text-gray-600">{card.label}</p>
          </button>
        ))}
      </div>
      <Notice tone="info">
        An "order" is recorded each time a visitor presses <strong>Order via WhatsApp</strong> in the shop. The site cannot see what happens
        inside WhatsApp, so open the <strong>Orders</strong> tab to mark each one as dispatched or not once you have dealt with the customer.
      </Notice>
    </div>
  )
}
