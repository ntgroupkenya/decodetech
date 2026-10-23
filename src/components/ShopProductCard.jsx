import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import ProductImage from './ProductImage'
import AddToCartButton from './AddToCartButton'
import PriceLine from './PriceLine'
import FreeGiftBadge from './FreeGiftBadge'
import ConditionTag from './ConditionTag'
import HotFeature from './HotFeature'
import { productPath } from '../productSlug'

// One product in the Shop, as a grid tile or a list row. `badge` ({ label, className }) marks highlight lists.
// "Add to cart" fills the bottom; the green button orders this one product on WhatsApp; "Get a quote" asks for pricing.
export default function ShopProductCard({ product, offers, view = 'grid', badge, onOrder, onQuote, onOpen }) {
  const isList = view === 'list'
  const name = <Link to={productPath(product)} className="hover:text-brand-indigo hover:underline">{product.name}</Link>

  const actions = (
    <div className={isList ? 'flex w-full flex-col gap-1.5 sm:w-48 sm:shrink-0' : 'mt-auto flex flex-col gap-1.5 pt-3'}>
      <div className="flex gap-1.5">
        <AddToCartButton product={product} />
        <button
          type="button"
          onClick={() => onOrder(product)}
          aria-label={`Order ${product.name} on WhatsApp`}
          title="Order on WhatsApp"
          className="flex h-9 w-10 shrink-0 items-center justify-center rounded-md bg-green-600 text-white transition-colors hover:bg-green-700"
        >
          <MessageCircle size={18} aria-hidden="true" />
        </button>
      </div>
      {onQuote && (
        <button type="button" onClick={() => onQuote(product)} className="text-left text-xs font-medium text-brand-indigo hover:text-brand-charcoal hover:underline sm:text-center">
          Get a quote
        </button>
      )}
    </div>
  )

  const photo = (
    <div className="relative">
      <ProductImage src={product.image} alt={product.name} onOpen={() => onOpen(product)} />
      {badge && <span className={`pointer-events-none absolute left-0 top-2 rounded-r-sm px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${badge.className}`}>{badge.label}</span>}
      <FreeGiftBadge gift={product.freeGift} />
    </div>
  )

  const meta = (
    <div className="flex flex-wrap items-center gap-2">
      {product.brand && <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-indigo">{product.brand}</span>}
      <ConditionTag condition={product.condition} />
    </div>
  )

  if (isList) {
    return (
      <article className="flex overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-brand-teal">
        <div className="w-28 shrink-0 border-r border-gray-100 sm:w-44">{photo}</div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-6 sm:p-4">
          <div className="min-w-0 flex-1 space-y-1">
            {meta}
            <h3 className="line-clamp-2 text-base font-semibold text-brand-charcoal">{name}</h3>
            <HotFeature feature={product.hotFeature} />
            <p className="line-clamp-1 text-sm text-gray-600 sm:line-clamp-2">{product.specs}</p>
          </div>
          <div className="flex flex-col gap-2 sm:w-48 sm:shrink-0">
            <PriceLine product={product} offers={offers} />
            {actions}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-brand-teal">
      <div className="border-b border-gray-100">{photo}</div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {meta}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-brand-charcoal">{name}</h3>
        <HotFeature feature={product.hotFeature} />
        {product.specs && <p className="line-clamp-1 text-xs text-gray-500">{product.specs}</p>}
        <div className="pt-1"><PriceLine product={product} offers={offers} /></div>
        {actions}
      </div>
    </article>
  )
}
