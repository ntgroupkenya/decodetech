import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_PHOTOS } from '../categoryPhotos'
import { categorySlug } from '../categories'

// Photos behind the Shop's intro panel. They fade into each other every 7 seconds under a dark shade that keeps the text
// readable; visitors who ask for reduced motion see the first photo only. The first three are the shop's own photos
// (public/hero/); the rest are category photos (src/categoryPhotos.js), each with a "Shop <category>" link.
// `position` keeps the interesting part of each photo in view when it is cropped to the panel.
const HERO = [
  { src: 'hero/laptop.jpg', position: '70% 60%' },
  { src: 'hero/keyboard.jpg', position: 'center' },
  { src: 'hero/motherboard.jpg', position: 'center' },
]
const SLIDE_CATEGORIES = ['Laptops', 'Phones', 'Audio', 'CCTV Cameras', 'TVs', 'Desktops', 'Keyboards & Mice', 'Kitchen Appliances']

export default function HeroBackdrop({ categories = [] }) {
  const [active, setActive] = useState(0)
  // Only categories the shop has right now get a slide.
  const inShop = new Set(categories.map((c) => c.name))
  const slides = [
    ...HERO,
    ...SLIDE_CATEGORIES.filter((name) => CATEGORY_PHOTOS[name] && inShop.has(name)).map((name) => ({ src: CATEGORY_PHOTOS[name], position: 'center', category: name })),
  ]
  const current = slides[active % slides.length]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setTimeout(() => setActive((i) => (i + 1) % slides.length), 7000)
    return () => clearTimeout(timer)
  }, [active, slides.length])

  return (
    <>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {slides.map(({ src, position }, i) => (
          <img
            key={src}
            src={`${import.meta.env.BASE_URL}${src}`}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{ objectPosition: position }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${i === active % slides.length ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/85 to-brand-charcoal/40" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-charcoal/80 to-transparent" />
      </div>

      {/* Slide controls: the shown category's link and one dot per slide (large screens, above the steps bar). */}
      <div className="absolute bottom-[4.25rem] right-0 z-10 hidden w-full lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-4 px-8">
          {current.category && (
            <Link
              key={current.category}
              to={`/?cat=${categorySlug(current.category)}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-brand-primary hover:text-brand-ink"
            >
              Shop {current.category} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
          <div className="flex items-center gap-1.5" role="group" aria-label="Background photos">
            {slides.map(({ src, category }, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={category ? `Show ${category}` : `Show photo ${i + 1}`}
                aria-current={i === active % slides.length}
                className={`h-1.5 rounded-full transition-all ${i === active % slides.length ? 'w-6 bg-brand-teal' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
