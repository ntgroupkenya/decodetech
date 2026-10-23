import { PackageOpen } from 'lucide-react'

// Shown where a list would be when nothing has been added yet (no products, no categories...).
export default function EmptyState({ icon: Icon = PackageOpen, title, text, children, compact = false }) {
  return (
    <div className={`flex flex-col items-center rounded-md border border-dashed border-slate-300 bg-white text-center ${compact ? 'px-6 py-8' : 'px-6 py-14'}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-blue/10 text-brand-blue">
        <Icon size={24} aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold text-brand-charcoal">{title}</p>
      {text && <p className="mt-1 max-w-md text-sm text-gray-500">{text}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
