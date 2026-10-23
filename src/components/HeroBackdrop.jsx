import { useEffect, useState } from 'react'

// Photos behind the Shop's intro panel (public/hero/). They fade into each other every 7 seconds under a charcoal
// shade that keeps the text readable; visitors who ask for reduced motion see the first photo only.
// `position` keeps the interesting part of each photo in view when it is cropped to the panel.
const PHOTOS = [
  { file: 'laptop.jpg', position: '70% 60%' },
  { file: 'keyboard.jpg', position: 'center' },
  { file: 'motherboard.jpg', position: 'center' },
]

export default function HeroBackdrop() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setTimeout(() => setActive((i) => (i + 1) % PHOTOS.length), 7000)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {PHOTOS.map(({ file, position }, i) => (
        <img
          key={file}
          src={`${import.meta.env.BASE_URL}hero/${file}`}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          style={{ objectPosition: position }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${i === active ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/85 to-brand-charcoal/40" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-charcoal/80 to-transparent" />
    </div>
  )
}
