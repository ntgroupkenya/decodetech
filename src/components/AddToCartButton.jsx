import { ShoppingCart } from 'lucide-react'
import useCart from '../cart/useCart'

// "Add to cart": a small round icon over a product photo (variant "icon"), or a full-size button (variant "full").
export default function AddToCartButton({ product, variant = 'icon' }) {
  const { add } = useCart()

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => add(product)}
        className="flex min-w-[13rem] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-brand-charcoal px-6 py-3 font-semibold text-brand-charcoal transition-colors hover:bg-brand-charcoal hover:text-white"
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
      title="Add to cart"
      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-brand-charcoal shadow-md ring-1 ring-black/10 transition-colors hover:bg-brand-yellow"
    >
      <ShoppingCart size={18} aria-hidden="true" />
    </button>
  )
}
