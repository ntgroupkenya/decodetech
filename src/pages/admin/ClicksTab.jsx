import useLoad from './useLoad'
import { Empty, Notice } from './Widgets'
import { formatDate } from './ui'

export default function ClicksTab() {
  const { data, error, loading } = useLoad('/admin/clicks')

  if (error) return <Notice>{error}</Notice>
  if (loading && !data) return <p className="text-gray-500">Loading…</p>

  const { top, recent, totals } = data

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Every time a visitor presses a WhatsApp button or link. <strong>{totals.total}</strong> clicks in total, <strong>{totals.last7}</strong> in the last 7 days.
      </p>

      <section>
        <h2 className="mb-2 font-semibold text-brand-charcoal">Most clicked products</h2>
        {top.length === 0 ? (
          <Empty>No product clicks yet.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Clicks</th><th className="px-4 py-3">Last click</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {top.map((row) => (
                  <tr key={row.product_id}>
                    <td className="px-4 py-3 font-medium text-brand-charcoal">{row.name || row.product_id}</td>
                    <td className="px-4 py-3">{row.clicks}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(row.last_click)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-brand-charcoal">Recent clicks</h2>
        {recent.length === 0 ? (
          <Empty>No clicks recorded yet.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Button</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Page</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-600">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-2">{row.label || '—'}</td>
                    <td className="px-4 py-2">{row.product_name || row.product_id || '—'}</td>
                    <td className="px-4 py-2 text-gray-600">{row.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
