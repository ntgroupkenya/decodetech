import { useEffect, useState } from 'react'
import { ImageOff, X, ZoomIn } from 'lucide-react'
import { assetUrl } from '../api'

// A product photo on a light panel (shown whole, not cropped); clicking it opens a larger view.
// `sample` marks a brand photo standing in for a product without its own (see productPhotos.js).
export default function ProductImage({ src: rawSrc, alt, className = '', onOpen, sample = false }) {
  const src = assetUrl(rawSrc)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnEscape = event => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  if (!src) {
    return (
      <div className={`flex aspect-square w-full flex-col items-center justify-center gap-2 bg-slate-50 text-xs text-gray-400 ${className}`}>
        <ImageOff size={28} aria-hidden="true" />
        No photo yet
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          onOpen?.()
        }}
        aria-label={`View larger image: ${alt}`}
        className={`group relative block aspect-square w-full overflow-hidden bg-slate-50 ${className}`}
      >
        <img
          src={src}
          alt={sample ? `Sample image: ${alt}` : alt}
          loading="lazy"
          className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${sample ? 'object-cover' : 'object-contain p-3 mix-blend-multiply'}`}
        />
        {sample && (
          <span className="pointer-events-none absolute right-2 top-2 rounded-sm bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-charcoal shadow-sm">
            Sample image
          </span>
        )}
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-brand-charcoal opacity-0 shadow ring-1 ring-black/5 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn size={16} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Larger image: ${alt}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-ink/90 p-4 sm:p-8"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close enlarged image"
            className="absolute right-4 top-4 z-10 rounded-md bg-white/10 p-3 text-white transition hover:bg-white/25"
          >
            <X size={24} />
          </button>
          <div className="relative inline-block max-h-[90vh] max-w-[92vw] rounded-md bg-white p-2" onClick={event => event.stopPropagation()}>
            <img src={src} alt={alt} className="max-h-[86vh] max-w-[88vw] object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
