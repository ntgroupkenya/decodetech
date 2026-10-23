// A drawn laptop with the brand name on its lid, shown for laptops that have no photo yet.
// The lid colour comes from the logo's colours and stays the same for a brand.
const LIDS = [
  { fill: 'var(--color-brand-indigo)', text: '#ffffff' },
  { fill: 'var(--color-brand-charcoal)', text: '#ffffff' },
  { fill: 'var(--color-brand-teal)', text: 'var(--color-brand-ink)' },
  { fill: 'var(--color-brand-red)', text: '#ffffff' },
]

function lidFor(brand) {
  let hash = 0
  for (const ch of String(brand).toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return LIDS[hash % LIDS.length]
}

export default function LaptopPlaceholder({ brand, className = '' }) {
  const name = String(brand || 'Laptop').trim()
  const lid = lidFor(name)
  // Long names get smaller type so they stay on the lid.
  const size = Math.min(46, Math.floor(400 / Math.max(name.length, 4)))
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={`${name} laptop, no photo yet`} className={className}>
      <rect x="70" y="95" width="260" height="180" rx="14" fill={lid.fill} />
      <rect x="84" y="109" width="232" height="152" rx="8" fill="#ffffff" opacity="0.08" />
      <text x="200" y="185" textAnchor="middle" dominantBaseline="middle" fill={lid.text} fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize={size}>
        {name}
      </text>
      <rect x="45" y="275" width="310" height="20" rx="3" fill="var(--color-brand-grey)" />
      <rect x="170" y="275" width="60" height="6" rx="3" fill="#ffffff" opacity="0.5" />
    </svg>
  )
}
