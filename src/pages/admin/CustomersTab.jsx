import useLoad from './useLoad'
import { Empty, Notice } from './Widgets'
import { formatDate } from './ui'

export default function CustomersTab() {
  const { data, error, loading } = useLoad('/admin/customers')
  const customers = data?.customers ?? []

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Customers who created an account on the site.</p>
      {error && <Notice>{error}</Notice>}
      {!loading && customers.length === 0 && !error && <Empty>No customer accounts yet.</Empty>}
      {customers.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-brand-charcoal">{c.name}</td>
                  <td className="px-4 py-3">{c.username}</td>
                  <td className="px-4 py-3"><a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
