import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_PHOTOS } from '../categoryPhotos'
import { CATEGORY_KINDS } from '../productPhotos'
import ProductPlaceholder from './ProductPlaceholder'

// A category as a picture card: its photo (or a drawing of the product type) behind a dark fade, with the name and count.
const TINTS = ['bg-brand-primary/10', 'bg-brand-teal/15', 'bg-brand-indigo/10', 'bg-brand-grey/30']

export default function CategoryCard({ slug, name, count, index = 0, className = '' }) {
  const photo = CATEGORY_PHOTOS[name]
  return (
    <Link
      to={`/?cat=${slug}`}
      className={`group relative isolate flex aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg ${className}`}
    >
      {photo ? (
        <img
          src={`${import.meta.env.BASE_URL}${photo}`}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 -z-10 ${TINTS[index % TINTS.length]}`}>
          <ProductPlaceholder
            kind={CATEGORY_KINDS[name] || 'box'}
            brand=""
            className="absolute -right-[8%] -top-[6%] h-[95%] w-auto opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink/90 via-brand-ink/35 to-transparent" />
      <div className="mt-auto flex w-full items-end justify-between gap-2 p-3 text-white sm:p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold leading-tight sm:text-lg">{name}</h3>
          <p className="font-mono text-xs text-white/75">{count} product{count === 1 ? '' : 's'}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true">
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  )
}
