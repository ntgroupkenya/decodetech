import { useEffect, useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { assetUrl } from '../api'

export default function ProductImage({ src: rawSrc, alt, className = '', onOpen }) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          onOpen?.()
        }}
        aria-label={`View larger image: ${alt}`}
        className={`group relative block aspect-square w-full overflow-hidden bg-white ${className}`}
      >
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-brand-charcoal/0 text-white opacity-0 transition group-hover:bg-brand-charcoal/25 group-hover:opacity-100 group-focus-visible:bg-brand-charcoal/25 group-focus-visible:opacity-100">
          <ZoomIn size={30} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Larger image: ${alt}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close enlarged image"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
          >
            <X size={24} />
          </button>
          <div className="relative inline-block max-h-[90vh] max-w-[92vw]" onClick={event => event.stopPropagation()}>
            <img src={src} alt={alt} className="max-h-[90vh] max-w-[92vw] object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </>
  )
}
