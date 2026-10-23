import PARTNER_LOGOS from '../data/partnerLogos'

// One logo (or the brand name until a logo file is set). Duplicates are hidden from screen readers.
function Logo({ name, logo, duplicate }) {
  return (
    <li aria-hidden={duplicate || undefined} className="flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 sm:w-52">
      {logo ? (
        <img src={logo} alt={duplicate ? '' : name} loading="lazy" className="h-10 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105" />
      ) : (
        <span className="font-heading text-2xl font-bold tracking-wide text-slate-400">{name}</span>
      )}
    </li>
  )
}

// At least this many tiles per copy, so one copy is wider than a large screen and the loop never shows a gap.
const MIN_TILES = 9

// A row that scrolls forever: the tiles are rendered twice and the track moves left by exactly one copy.
function Row({ items, reverse }) {
  const copy = []
  while (copy.length < Math.max(MIN_TILES, items.length)) copy.push(...items)
  return (
    <div className="marquee">
      <ul className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}>
        {copy.map((item, i) => <Logo key={`a${i}`} {...item} duplicate={i >= items.length} />)}
        {copy.map((item, i) => <Logo key={`b${i}`} {...item} duplicate />)}
      </ul>
    </div>
  )
}

export default function LogoMarquee({ logos = PARTNER_LOGOS }) {
  if (!logos.length) return null
  // Alternate the brands between two rows that scroll in opposite directions.
  const rows = [logos.filter((_, i) => i % 2 === 0), logos.filter((_, i) => i % 2 === 1)].filter((row) => row.length)
  return (
    <div className="space-y-4">
      {rows.map((row, index) => <Row key={index} items={row} reverse={index === 1} />)}
    </div>
  )
}
