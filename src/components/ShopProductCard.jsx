import { MessageCircle } from 'lucide-react'
import ProductImage from './ProductImage'
import AddToCartButton from './AddToCartButton'
import SiteLink from './SiteLink'
import PriceLine from './PriceLine'
import FreeGiftBadge from './FreeGiftBadge'
import ConditionTag from './ConditionTag'
import HotFeature from './HotFeature'
import { productPath } from '../productSlug'

// One product in the Shop, as a grid tile or a list row.
export default function ShopProductCard({ product, offers, view, onOrder, onQuote, onOpen }) {
  const isList = view === 'list'

  // Grid cards shrink the label on narrow cards (many per row) so it stays on one line.
  const size = isList ? 'px-2 py-2 text-sm' : 'px-1 py-2 text-xs @[13rem]:px-2 @[13rem]:text-sm'
  const buttons = (
    <div className={isList ? 'grid grid-cols-2 gap-2 sm:w-44 sm:shrink-0' : 'mt-auto grid grid-cols-2 gap-2 pt-2'}>
      <button
        onClick={() => onOrder(product)}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 font-semibold text-white transition-colors hover:bg-green-700 ${size}`}
      >
        <MessageCircle size={14} className="shrink-0" />
        <span>Order</span>
      </button>
      <button
        onClick={() => onQuote(product)}
        className={`w-full rounded-lg bg-brand-yellow font-semibold text-brand-charcoal transition-colors hover:bg-brand-orange ${size}`}
      >
        Get Quote
      </button>
    </div>
  )

  if (isList) {
    return (
      <div className="flex overflow-hidden rounded-xl border-2 border-transparent bg-white shadow-md transition-all hover:border-brand-yellow hover:shadow-xl">
        <div className="relative w-28 shrink-0 sm:w-48">
          <ProductImage src={product.image} alt={product.name} onOpen={() => onOpen(product)} />
          <AddToCartButton product={product} />
          <FreeGiftBadge gift={product.freeGift} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-gray-500">{product.brand}</span>
              <ConditionTag condition={product.condition} />
            </div>
            <h3 className="mb-1 line-clamp-2 text-base font-semibold text-brand-charcoal sm:text-lg"><SiteLink to={productPath(product)} className="hover:underline">{product.name}</SiteLink></h3>
            <HotFeature feature={product.hotFeature} className="mb-1" />
            <p className="mb-2 line-clamp-1 text-sm text-gray-600 sm:line-clamp-2">{product.specs}</p>
            <PriceLine product={product} offers={offers} />
          </div>
          {buttons}
        </div>
      </div>
    )
  }

  return (
    <div className="@container flex flex-col overflow-hidden rounded-xl border-2 border-transparent bg-white shadow-md transition-all hover:border-brand-yellow hover:shadow-xl">
      <div className="relative">
        <ProductImage src={product.image} alt={product.name} onOpen={() => onOpen(product)} />
        <AddToCartButton product={product} />
        <FreeGiftBadge gift={product.freeGift} />
      </div>
      <div className="flex flex-1 flex-col p-4 @[17rem]:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-gray-500">{product.brand}</span>
          <ConditionTag condition={product.condition} />
        </div>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-brand-charcoal"><SiteLink to={productPath(product)} className="hover:underline">{product.name}</SiteLink></h3>
        <HotFeature feature={product.hotFeature} className="mb-2" />
        <p className="mb-3 line-clamp-1 text-sm text-gray-600">{product.specs}</p>
        <PriceLine product={product} offers={offers} />
        {buttons}
      </div>
    </div>
  )
}
