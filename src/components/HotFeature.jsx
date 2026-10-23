import { Zap } from 'lucide-react'

// One-line selling point ("16GB RAM + Iris Xe graphics") shown under the product name.
export default function HotFeature({ feature, className = '' }) {
  if (!feature) return null
  return (
    <p className={`flex items-start gap-1.5 text-sm font-semibold text-brand-ember ${className}`}>
      <Zap size={14} className="mt-0.5 shrink-0 fill-current" aria-hidden="true" />
      <span className="line-clamp-2">{feature}</span>
    </p>
  )
}
