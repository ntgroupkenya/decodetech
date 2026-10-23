import { useMemo, useState } from 'react'
import { Flame, MousePointerClick, Trophy } from 'lucide-react'
import ShopProductCard from './ShopProductCard'

const TABS = [
  { key: 'hot', label: 'Hot products', icon: Flame, badge: { label: 'Hot', className: 'bg-brand-red text-white' }, width: 'w-60 sm:w-64' },
  { key: 'bestSellers', label: 'Best sellers', icon: Trophy, badge: { label: 'Best seller', className: 'bg-brand-teal text-brand-ink' }, width: 'w-52 sm:w-56' },
  { key: 'mostClicked', label: 'Most clicked', icon: MousePointerClick, badge: { label: 'Popular', className: 'bg-brand-primary text-white' }, width: 'w-52 sm:w-56' },
]

// A sideways-scrolling row of products picked by the admin (hot), by real dispatched orders (best sellers)
// and by shopper interest (most clicked). Hot products get slightly wider cards.
export default function ShopHighlights({ products, highlights, offers, onOrder, onOpen }) {
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const lists = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, (highlights[t.key] || []).map((id) => byId.get(id)).filter(Boolean)])),
    [byId, highlights],
  )
  const available = TABS.filter((t) => lists[t.key].length > 0)
  const [chosen, setChosen] = useState(null)

  if (available.length === 0) return null
  const active = available.find((t) => t.key === chosen) || available[0]
  const items = lists[active.key]

  return (
    <section className="rounded-md border border-gray-200 bg-white" aria-label="Shop highlights">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-gray-200 px-2" role="tablist" aria-label="Highlight lists">
        {available.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active.key === key}
            onClick={() => setChosen(key)}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${active.key === key ? 'border-brand-red text-brand-charcoal' : 'border-transparent text-gray-500 hover:text-brand-charcoal'}`}
          >
            <Icon size={16} aria-hidden="true" /> {label}
            <span className="font-mono text-xs text-gray-400">{lists[key].length}</span>
          </button>
        ))}
      </div>

      <ul className="no-scrollbar flex snap-x gap-3 overflow-x-auto p-3" role="tabpanel">
        {items.map((product) => (
          <li key={product.id} className={`${active.width} shrink-0 snap-start`}>
            <ShopProductCard product={product} offers={offers} badge={active.badge} onOrder={onOrder} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  )
}
