import { ShoppingCart } from 'lucide-react'
import useCart from '../cart/useCart'

// "Add to cart": the full-width bar on product cards (variant "bar"), or the large button on product pages (variant "full").
export default function AddToCartButton({ product, variant = 'bar' }) {
  const { add } = useCart()

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => add(product)}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-primary-dark"
      >
        <ShoppingCart size={20} aria-hidden="true" /> Add to cart
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => add(product)}
      aria-label={`Add ${product.name} to cart`}
      className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-brand-primary px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
    >
      <ShoppingCart size={16} className="shrink-0" aria-hidden="true" />
      <span className="truncate">Add to cart</span>
    </button>
  )
}
