export function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    amber: 'bg-amber-100 text-amber-800',
    purple: 'bg-purple-100 text-purple-800',
  }
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function Notice({ tone = 'error', children }) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-800',
    ok: 'border-green-200 bg-green-50 text-green-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}

export function Empty({ children }) {
  return <p className="rounded-md border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500">{children}</p>
}
