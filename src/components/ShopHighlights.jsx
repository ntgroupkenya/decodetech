import { useMemo, useState } from 'react'
import SiteLink from './SiteLink'
import { productPath } from '../productSlug'
import { Flame, MessageCircle, MousePointerClick, Trophy } from 'lucide-react'
import ProductImage from './ProductImage'
import AddToCartButton from './AddToCartButton'
import FreeGiftBadge from './FreeGiftBadge'
import ConditionTag from './ConditionTag'
import HotFeature from './HotFeature'

const TABS = [
  { key: 'hot', label: 'Hot products', icon: Flame, badge: 'Hot', badgeClass: 'bg-red-600 text-white' },
  { key: 'bestSellers', label: 'Best sellers', icon: Trophy, badge: 'Best seller', badgeClass: 'bg-brand-yellow text-brand-charcoal' },
  { key: 'mostClicked', label: 'Most clicked', icon: MousePointerClick, badge: 'Popular', badgeClass: 'bg-brand-charcoal text-white' },
]

// Rows of products picked by the admin (hot), by real dispatched orders (best sellers) and by shopper interest (most clicked).
export default function ShopHighlights({ products, highlights, onOrder, onOpen }) {
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
    <section className="mt-6 border-y border-gray-200 bg-white" aria-label="Shop highlights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto" role="tablist" aria-label="Highlight lists">
          {available.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active.key === key}
              onClick={() => setChosen(key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active.key === key ? 'bg-brand-charcoal text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {/* Phones: one full-width column. Larger screens: a row that scrolls sideways. */}
        <ul className="no-scrollbar flex flex-col gap-4 sm:snap-x sm:flex-row sm:overflow-x-auto sm:pb-3" role="tabpanel">
          {items.map((product) => (
            <li key={product.id} className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md sm:w-80 sm:shrink-0 sm:snap-start lg:w-96">
              <div className="relative">
                <ProductImage src={product.image} alt={product.name} onOpen={() => onOpen(product)} />
                <AddToCartButton product={product} />
                <FreeGiftBadge gift={product.freeGift} />
                <span className={`pointer-events-none absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold shadow ${active.badgeClass}`}>{active.badge}</span>
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">{product.brand}</p>
                  <ConditionTag condition={product.condition} />
                </div>
                <p className="line-clamp-2 min-h-[3rem] text-lg font-semibold text-brand-charcoal"><SiteLink to={productPath(product)} className="hover:underline">{product.name}</SiteLink></p>
                <HotFeature feature={product.hotFeature} />
                <p className="text-base text-gray-600">
                  {product.price && Number(product.oldPrice) > Number(product.price) && <span className="mr-2 text-sm text-gray-400 line-through">KES {Number(product.oldPrice).toLocaleString()}</span>}
                  {product.price ? `KES ${Number(product.price).toLocaleString()}` : 'Price on request'}
                </p>
                <button
                  type="button"
                  onClick={() => onOrder(product)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-2 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <MessageCircle size={16} className="shrink-0" /> Order
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
