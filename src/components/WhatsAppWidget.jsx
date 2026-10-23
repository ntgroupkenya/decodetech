import { BadgeDollarSign, Globe, MessageCircle, Receipt, Sparkles, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import { whatsappMessageUrl } from '../contact'
import { useSiteSettings } from '../siteSettings'

// Quick questions offered in the chat popup; each opens WhatsApp with the message typed.
const TOPICS = [
  { icon: Sparkles, label: 'Help me choose a product', message: 'Hi DECODE, I need help choosing a product' },
  { icon: BadgeDollarSign, label: 'Get a price quote', message: 'Hi DECODE, I would like a price quote' },
  { icon: Wrench, label: 'Repair my computer', message: 'Hi DECODE, I need my computer repaired' },
  { icon: Receipt, label: 'POS system for my shop', message: 'Hi DECODE, I would like a POS system for my shop' },
  { icon: Globe, label: 'Build a website', message: 'Hi DECODE, I would like a website built' },
]

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { whatsappUrl } = useSiteSettings()

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-green-600 py-3 pl-3.5 pr-4 font-semibold text-white shadow-lg ring-1 ring-black/10 transition-colors hover:bg-green-700"
        aria-label={isOpen ? 'Close chat options' : 'Chat with us on WhatsApp'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} aria-hidden="true" />}
        <span className="hidden sm:inline">{isOpen ? 'Close' : 'Need help?'}</span>
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="grid-backdrop p-5 text-white">
            <div className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}decode-mark-48.png`} alt="" width="40" height="40" className="h-10 w-10 rounded-md bg-white p-1" />
              <div>
                <h3 className="font-semibold">DECODE Tech Support</h3>
                <p className="text-xs text-blue-100">Usually replies within minutes</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="mb-3 text-sm text-gray-600">What can we help you with?</p>
            <div className="space-y-2">
              {TOPICS.map(({ icon: Icon, label, message }) => (
                <a
                  key={label}
                  href={whatsappMessageUrl(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-md border border-slate-200 p-3 text-left text-sm text-brand-charcoal transition-colors hover:border-brand-teal hover:bg-brand-teal/5"
                >
                  <Icon size={18} className="shrink-0 text-brand-primary" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-md bg-green-600 py-3 text-center font-semibold text-white transition-colors hover:bg-green-700"
            >
              Start a WhatsApp chat
            </a>
          </div>
        </div>
      )}
    </>
  )
}
