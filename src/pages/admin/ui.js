export const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal bg-white'
export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-teal-light disabled:opacity-50 disabled:cursor-not-allowed'
export const btnYellow = 'inline-flex items-center justify-center gap-2 rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-brand-charcoal hover:bg-brand-teal-light disabled:opacity-50 disabled:cursor-not-allowed'
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}
