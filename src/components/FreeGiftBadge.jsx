import { Gift } from 'lucide-react'

// "FREE <gift>" ribbon. Over a product photo by default; `inline` for use in running text (product page).
export default function FreeGiftBadge({ gift, inline = false }) {
  if (!gift) return null
  const position = inline ? 'inline-flex' : 'pointer-events-none absolute bottom-2 left-2 inline-flex max-w-[calc(100%-1rem)]'
  return (
    <span className={`${position} items-center gap-1 rounded-sm bg-brand-ember px-2 py-0.5 text-[11px] font-bold uppercase text-white`}>
      <Gift size={13} className="shrink-0" aria-hidden="true" />
      <span className="truncate">FREE {gift}</span>
    </span>
  )
}
