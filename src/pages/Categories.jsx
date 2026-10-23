import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import CategoryCard from '../components/CategoryCard'
import useProducts from '../useProducts'
import { groupCategories } from '../categories'

// Every shop category as a picture card, biggest first.
export default function Categories() {
  const products = useProducts().filter((p) => p.inShop !== false && p.active !== false)
  const categories = groupCategories(products)

  return (
    <div className="pb-16">
      <section className="bg-brand-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <ChevronLeft size={16} aria-hidden="true" /> Shop
          </Link>
          <p className="code-label mt-3 !text-brand-teal">all categories</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Shop by category</h1>
          <p className="mt-2 text-white/75">{categories.length} categories, {products.length} products.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pt-6 sm:grid-cols-3 sm:gap-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {categories.map(({ slug, name, products: items }, index) => (
          <CategoryCard key={slug} slug={slug} name={name} count={items.length} index={index} />
        ))}
      </div>
    </div>
  )
}
