// A simple drawing of the product type with the brand name, shown for products that have no photo yet.
// The main colour comes from the logo's colours and stays the same for a brand. `kind` comes from productPhotos.js.
const COLOURS = [
  { fill: 'var(--color-brand-indigo)', text: '#ffffff' },
  { fill: 'var(--color-brand-charcoal)', text: '#ffffff' },
  { fill: 'var(--color-brand-teal)', text: 'var(--color-brand-ink)' },
  { fill: 'var(--color-brand-red)', text: '#ffffff' },
]
const GREY = 'var(--color-brand-grey)'
const INK = 'var(--color-brand-ink)'
const WHITE = '#ffffff'

function colourFor(brand) {
  let hash = 0
  for (const ch of String(brand).toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return COLOURS[hash % COLOURS.length]
}

const lens = (cx, cy, r) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill={INK} />
    <circle cx={cx} cy={cy} r={r * 0.55} fill="#1f2a5c" />
    <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.18} fill={WHITE} opacity="0.7" />
  </>
)

// Each drawing fits roughly inside x 60-340, y 70-290, leaving room for the brand name below.
const DRAWINGS = {
  bullet: (c) => (
    <>
      <rect x="215" y="150" width="20" height="95" fill={GREY} />
      <rect x="180" y="240" width="90" height="22" rx="4" fill={GREY} />
      <rect x="70" y="105" width="230" height="80" rx="30" fill={c.fill} />
      <rect x="250" y="98" width="70" height="94" rx="12" fill={c.fill} />
      <rect x="62" y="98" width="70" height="14" rx="6" fill={GREY} />
      {lens(95, 145, 26)}
    </>
  ),
  dome: (c) => (
    <>
      <rect x="85" y="215" width="230" height="30" rx="8" fill={GREY} />
      <path d="M95 215 A105 105 0 0 1 305 215 Z" fill={c.fill} />
      {lens(200, 175, 34)}
    </>
  ),
  cube: (c) => (
    <>
      <rect x="170" y="235" width="60" height="18" fill={GREY} />
      <rect x="130" y="250" width="140" height="22" rx="8" fill={GREY} />
      <rect x="115" y="80" width="170" height="160" rx="30" fill={c.fill} />
      {lens(200, 150, 38)}
    </>
  ),
  pan: (c) => (
    <>
      <path d="M130 270 L150 205 L250 205 L270 270 Z" fill={c.fill} />
      <rect x="120" y="265" width="160" height="16" rx="6" fill={GREY} />
      <circle cx="200" cy="150" r="78" fill={GREY} />
      <circle cx="200" cy="150" r="64" fill={WHITE} />
      {lens(200, 150, 34)}
    </>
  ),
  recorder: (c) => (
    <>
      <rect x="55" y="140" width="290" height="90" rx="8" fill={c.fill} />
      <rect x="55" y="140" width="290" height="16" rx="8" fill={WHITE} opacity="0.15" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={80 + i * 16} y="185" width="8" height="26" rx="2" fill={WHITE} opacity="0.25" />)}
      <circle cx="290" cy="190" r="6" fill="#4ade80" />
      <circle cx="312" cy="190" r="6" fill={WHITE} opacity="0.5" />
      <rect x="70" y="230" width="30" height="10" fill={GREY} />
      <rect x="300" y="230" width="30" height="10" fill={GREY} />
    </>
  ),
  switch: (c) => (
    <>
      <rect x="55" y="150" width="290" height="80" rx="8" fill={c.fill} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={75 + i * 26} y="180" width="20" height="18" rx="2" fill={INK} />)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={80 + i * 26} y="205" width="10" height="5" rx="1" fill="#4ade80" opacity={i % 3 ? 0.9 : 0.3} />)}
      <circle cx="305" cy="190" r="6" fill="#4ade80" />
    </>
  ),
  cable: (c) => (
    <>
      <rect x="95" y="80" width="210" height="200" rx="10" fill={c.fill} />
      <circle cx="200" cy="180" r="62" fill={WHITE} opacity="0.15" />
      <circle cx="200" cy="180" r="44" fill="none" stroke={WHITE} strokeWidth="10" opacity="0.6" />
      <circle cx="200" cy="180" r="22" fill={INK} />
      <path d="M200 180 C 260 180, 300 240, 330 280" fill="none" stroke={GREY} strokeWidth="10" strokeLinecap="round" />
      <rect x="320" y="270" width="26" height="22" rx="3" fill={GREY} />
    </>
  ),
  intercom: (c) => (
    <>
      <rect x="135" y="70" width="130" height="220" rx="16" fill={c.fill} />
      <rect x="150" y="88" width="100" height="70" rx="6" fill={INK} />
      {lens(200, 123, 18)}
      {[0, 1, 2].map((i) => <rect key={i} x="160" y={178 + i * 14} width="80" height="5" rx="2" fill={WHITE} opacity="0.3" />)}
      <circle cx="200" cy="250" r="20" fill={WHITE} opacity="0.9" />
      <circle cx="200" cy="250" r="11" fill={c.fill} />
    </>
  ),
  mouse: (c) => (
    <>
      <rect x="140" y="70" width="120" height="200" rx="60" fill={c.fill} />
      <line x1="200" y1="72" x2="200" y2="140" stroke={WHITE} strokeWidth="4" opacity="0.5" />
      <line x1="142" y1="140" x2="258" y2="140" stroke={WHITE} strokeWidth="4" opacity="0.3" />
      <rect x="192" y="95" width="16" height="30" rx="8" fill={INK} />
    </>
  ),
  combo: (c) => (
    <>
      <rect x="45" y="150" width="235" height="100" rx="10" fill={c.fill} />
      {[0, 1, 2].map((row) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <rect key={`${row}-${i}`} x={58 + i * 24} y={162 + row * 24} width="18" height="18" rx="3" fill={WHITE} opacity="0.25" />
      )))}
      <rect x="100" y="234" width="120" height="8" rx="3" fill={WHITE} opacity="0.25" />
      <rect x="295" y="165" width="60" height="95" rx="30" fill={c.fill} />
      <line x1="325" y1="167" x2="325" y2="200" stroke={WHITE} strokeWidth="3" opacity="0.5" />
    </>
  ),
  headset: (c) => (
    <>
      <path d="M110 200 C 110 70, 290 70, 290 200" fill="none" stroke={c.fill} strokeWidth="18" strokeLinecap="round" />
      <rect x="85" y="180" width="55" height="90" rx="22" fill={c.fill} />
      <rect x="260" y="180" width="55" height="90" rx="22" fill={c.fill} />
      <rect x="100" y="195" width="25" height="60" rx="12" fill={INK} opacity="0.35" />
      <path d="M112 262 C 120 300, 170 300, 195 292" fill="none" stroke={GREY} strokeWidth="7" strokeLinecap="round" />
      <circle cx="200" cy="291" r="9" fill={INK} />
    </>
  ),
  tower: (c) => (
    <>
      <rect x="135" y="60" width="130" height="230" rx="10" fill={c.fill} />
      <rect x="152" y="82" width="96" height="10" rx="3" fill={WHITE} opacity="0.3" />
      <rect x="152" y="100" width="96" height="10" rx="3" fill={WHITE} opacity="0.3" />
      <circle cx="200" cy="150" r="12" fill="none" stroke={WHITE} strokeWidth="4" opacity="0.8" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="160" y={200 + i * 14} width="80" height="5" rx="2" fill={INK} opacity="0.35" />)}
    </>
  ),
  aio: (c) => (
    <>
      <rect x="60" y="70" width="280" height="180" rx="12" fill={c.fill} />
      <rect x="74" y="84" width="252" height="140" rx="4" fill={WHITE} opacity="0.12" />
      <circle cx="200" cy="237" r="5" fill={WHITE} opacity="0.6" />
      <path d="M180 250 L170 290 L230 290 L220 250 Z" fill={GREY} />
    </>
  ),
  monitor: (c) => (
    <>
      <rect x="55" y="70" width="290" height="175" rx="8" fill={INK} />
      <rect x="65" y="80" width="270" height="155" rx="3" fill={c.fill} />
      <rect x="190" y="245" width="20" height="35" fill={GREY} />
      <rect x="140" y="278" width="120" height="12" rx="4" fill={GREY} />
    </>
  ),
  printer: (c) => (
    <>
      <rect x="125" y="70" width="150" height="60" rx="4" fill={WHITE} stroke={GREY} strokeWidth="4" />
      <rect x="70" y="125" width="260" height="120" rx="14" fill={c.fill} />
      <rect x="110" y="215" width="180" height="50" rx="4" fill={WHITE} stroke={GREY} strokeWidth="4" />
      <rect x="270" y="145" width="40" height="10" rx="3" fill={WHITE} opacity="0.5" />
      <circle cx="96" cy="150" r="6" fill="#4ade80" />
    </>
  ),
  projector: (c) => (
    <>
      <rect x="70" y="140" width="260" height="100" rx="20" fill={c.fill} />
      {lens(140, 190, 36)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={210 + i * 26} y="170" width="14" height="40" rx="4" fill={WHITE} opacity="0.25" />)}
      <rect x="95" y="240" width="20" height="18" fill={GREY} />
      <rect x="285" y="240" width="20" height="18" fill={GREY} />
    </>
  ),
  router: (c) => (
    <>
      <rect x="100" y="110" width="12" height="90" rx="5" fill={GREY} transform="rotate(-12 106 200)" />
      <rect x="288" y="110" width="12" height="90" rx="5" fill={GREY} transform="rotate(12 294 200)" />
      <rect x="70" y="190" width="260" height="70" rx="14" fill={c.fill} />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={110 + i * 22} cy="225" r="5" fill="#4ade80" opacity={i % 2 ? 0.5 : 1} />)}
    </>
  ),
  earbuds: (c) => (
    <>
      <rect x="120" y="170" width="160" height="110" rx="50" fill={GREY} />
      <rect x="120" y="170" width="160" height="40" rx="20" fill={WHITE} opacity="0.4" />
      <circle cx="160" cy="125" r="34" fill={c.fill} />
      <rect x="150" y="125" width="20" height="60" rx="10" fill={c.fill} />
      <circle cx="240" cy="125" r="34" fill={c.fill} />
      <rect x="230" y="125" width="20" height="60" rx="10" fill={c.fill} />
    </>
  ),
  speaker: (c) => (
    <>
      <rect x="70" y="120" width="260" height="140" rx="70" fill={c.fill} />
      <circle cx="140" cy="190" r="42" fill={INK} opacity="0.35" />
      <circle cx="260" cy="190" r="42" fill={INK} opacity="0.35" />
      <circle cx="140" cy="190" r="18" fill={WHITE} opacity="0.35" />
      <circle cx="260" cy="190" r="18" fill={WHITE} opacity="0.35" />
    </>
  ),
  mousepad: (c) => (
    <>
      <rect x="60" y="120" width="280" height="170" rx="18" fill={c.fill} />
      <rect x="60" y="245" width="280" height="45" rx="18" fill={INK} opacity="0.3" />
      <rect x="230" y="140" width="60" height="90" rx="30" fill={WHITE} opacity="0.85" />
    </>
  ),
  webcam: (c) => (
    <>
      <rect x="110" y="110" width="180" height="90" rx="45" fill={c.fill} />
      {lens(200, 155, 30)}
      <path d="M170 200 L160 240 L240 240 L230 200 Z" fill={GREY} />
      <rect x="140" y="236" width="120" height="12" rx="5" fill={GREY} />
    </>
  ),
  card: (c) => (
    <>
      <path d="M140 70 L240 70 L270 100 L270 290 L140 290 Z" fill={c.fill} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={158 + i * 24} y="82" width="14" height="34" rx="2" fill="#f5c542" />)}
      <rect x="160" y="160" width="90" height="70" rx="6" fill={WHITE} opacity="0.2" />
    </>
  ),
  flash: (c) => (
    <>
      <rect x="160" y="70" width="80" height="60" rx="4" fill={GREY} />
      <rect x="180" y="88" width="14" height="14" fill={INK} opacity="0.4" />
      <rect x="206" y="88" width="14" height="14" fill={INK} opacity="0.4" />
      <rect x="140" y="125" width="120" height="170" rx="22" fill={c.fill} />
      <circle cx="200" cy="265" r="10" fill={WHITE} opacity="0.4" />
    </>
  ),
  ram: (c) => (
    <>
      <rect x="40" y="150" width="320" height="90" rx="6" fill={c.fill} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={62 + i * 48} y="168" width="36" height="44" rx="3" fill={INK} opacity="0.55" />)}
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={50 + i * 12.6} y="232" width="7" height="14" fill="#f5c542" />)}
    </>
  ),
  drive: (c) => (
    <>
      <rect x="95" y="85" width="210" height="200" rx="14" fill={c.fill} />
      <rect x="115" y="105" width="170" height="90" rx="8" fill={WHITE} opacity="0.18" />
      <rect x="115" y="215" width="110" height="10" rx="4" fill={WHITE} opacity="0.4" />
      <rect x="115" y="235" width="80" height="10" rx="4" fill={WHITE} opacity="0.25" />
      <circle cx="270" cy="250" r="8" fill="#4ade80" />
    </>
  ),
  nas: (c) => (
    <>
      <rect x="110" y="60" width="180" height="230" rx="14" fill={c.fill} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x="130" y={85 + i * 46} width="140" height="36" rx="5" fill={INK} opacity="0.35" />)}
      {[0, 1, 2, 3].map((i) => <circle key={i} cx="252" cy={103 + i * 46} r="5" fill="#4ade80" />)}
    </>
  ),
  powerbank: (c) => (
    <>
      <rect x="120" y="70" width="160" height="220" rx="24" fill={c.fill} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={170 + i * 20} cy="250" r="5" fill={WHITE} opacity={i < 3 ? 0.9 : 0.3} />)}
      <path d="M210 120 L180 175 L205 175 L190 220 L230 160 L205 160 L220 120 Z" fill={WHITE} opacity="0.8" />
    </>
  ),
  ups: (c) => (
    <>
      <rect x="110" y="70" width="180" height="220" rx="12" fill={c.fill} />
      <rect x="135" y="95" width="130" height="50" rx="5" fill={INK} opacity="0.5" />
      <rect x="150" y="110" width="60" height="20" rx="3" fill="#4ade80" opacity="0.8" />
      <circle cx="200" cy="200" r="22" fill="none" stroke={WHITE} strokeWidth="6" opacity="0.8" />
      <rect x="196" y="172" width="8" height="26" rx="3" fill={WHITE} opacity="0.8" />
    </>
  ),
  charger: (c) => (
    <>
      <rect x="160" y="70" width="14" height="50" rx="3" fill={GREY} />
      <rect x="226" y="70" width="14" height="50" rx="3" fill={GREY} />
      <rect x="125" y="115" width="150" height="130" rx="22" fill={c.fill} />
      <rect x="185" y="200" width="30" height="12" rx="4" fill={INK} opacity="0.5" />
      <path d="M200 245 C 200 280, 260 270, 300 290" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  dock: (c) => (
    <>
      <rect x="60" y="160" width="250" height="70" rx="18" fill={c.fill} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={85 + i * 34} y="186" width="24" height="16" rx="3" fill={INK} opacity="0.55" />)}
      <rect x="230" y="184" width="40" height="20" rx="4" fill={INK} opacity="0.55" />
      <path d="M310 195 C 340 195, 345 150, 330 120" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
      <rect x="318" y="96" width="24" height="30" rx="5" fill={GREY} />
    </>
  ),
  phone: (c) => (
    <>
      <path d="M80 150 L320 150 L340 280 L60 280 Z" fill={c.fill} />
      <rect x="70" y="100" width="70" height="170" rx="30" fill={INK} opacity="0.85" />
      <rect x="170" y="170" width="120" height="44" rx="5" fill={WHITE} opacity="0.25" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((i) => <rect key={`${r}-${i}`} x={180 + i * 36} y={226 + r * 16} width="26" height="10" rx="3" fill={WHITE} opacity="0.5" />))}
    </>
  ),
  smartphone: (c) => (
    <>
      <rect x="140" y="62" width="120" height="232" rx="22" fill={c.fill} />
      <rect x="150" y="80" width="100" height="196" rx="12" fill={WHITE} opacity="0.22" />
      <rect x="185" y="70" width="30" height="5" rx="2.5" fill={INK} opacity="0.6" />
      <rect x="164" y="104" width="72" height="8" rx="4" fill={WHITE} opacity="0.55" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((i) => <rect key={`${r}-${i}`} x={164 + i * 26} y={130 + r * 30} width="20" height="20" rx="5" fill={WHITE} opacity="0.45" />))}
    </>
  ),
  tablet: (c) => (
    <>
      <rect x="75" y="78" width="250" height="200" rx="18" fill={c.fill} />
      <rect x="90" y="93" width="220" height="170" rx="8" fill={WHITE} opacity="0.22" />
      <circle cx="200" cy="85.5" r="3.5" fill={INK} opacity="0.6" />
      <rect x="110" y="114" width="110" height="10" rx="5" fill={WHITE} opacity="0.55" />
      {[0, 1, 2, 3, 4].map((i) => [0, 1].map((r) => <rect key={`${r}-${i}`} x={110 + i * 38} y={146 + r * 44} width="28" height="28" rx="7" fill={WHITE} opacity="0.45" />))}
    </>
  ),
  cord: (c) => (
    <>
      <path d="M110 110 C 110 260, 290 120, 290 270" fill="none" stroke={GREY} strokeWidth="12" strokeLinecap="round" />
      <rect x="84" y="62" width="52" height="64" rx="8" fill={c.fill} />
      <rect x="96" y="40" width="28" height="26" rx="3" fill={GREY} />
      <rect x="264" y="254" width="52" height="64" rx="8" fill={c.fill} />
      <rect x="276" y="314" width="28" height="10" rx="3" fill={GREY} />
    </>
  ),
  bag: (c) => (
    <>
      <path d="M150 110 C 150 60, 250 60, 250 110" fill="none" stroke={c.fill} strokeWidth="14" />
      <rect x="95" y="105" width="210" height="185" rx="28" fill={c.fill} />
      <rect x="125" y="190" width="150" height="70" rx="14" fill={INK} opacity="0.25" />
      <rect x="185" y="186" width="30" height="10" rx="3" fill={WHITE} opacity="0.5" />
    </>
  ),
  stand: (c) => (
    <>
      <rect x="95" y="105" width="210" height="120" rx="6" fill={GREY} transform="rotate(-14 200 165)" />
      <path d="M120 230 L280 190 L295 205 L140 255 Z" fill={c.fill} />
      <rect x="130" y="250" width="160" height="14" rx="5" fill={c.fill} />
      <path d="M215 215 L215 255" stroke={c.fill} strokeWidth="12" />
    </>
  ),
  box: (c) => (
    <>
      <path d="M200 70 L320 125 L200 180 L80 125 Z" fill={c.fill} opacity="0.75" />
      <path d="M80 125 L200 180 L200 300 L80 245 Z" fill={c.fill} />
      <path d="M320 125 L200 180 L200 300 L320 245 Z" fill={c.fill} opacity="0.85" />
      <path d="M140 97 L260 152 L260 190" fill="none" stroke={WHITE} strokeWidth="8" opacity="0.5" />
    </>
  ),
}

function Laptop({ c, name }) {
  // Long names get smaller type so they stay on the lid.
  const size = Math.min(46, Math.floor(400 / Math.max(name.length, 4)))
  return (
    <>
      <rect x="70" y="95" width="260" height="180" rx="14" fill={c.fill} />
      <rect x="84" y="109" width="232" height="152" rx="8" fill={WHITE} opacity="0.08" />
      <text x="200" y="185" textAnchor="middle" dominantBaseline="middle" fill={c.text} fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize={size}>
        {name}
      </text>
      <rect x="45" y="275" width="310" height="20" rx="3" fill={GREY} />
      <rect x="170" y="275" width="60" height="6" rx="3" fill={WHITE} opacity="0.5" />
    </>
  )
}

export default function ProductPlaceholder({ kind = 'laptop', brand, className = '' }) {
  const name = String(brand || '').trim()
  const c = colourFor(name || kind)
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={`${name ? `${name} ` : ''}${kind}, no photo yet`} className={className}>
      {kind === 'laptop' ? (
        <Laptop c={c} name={name || 'Laptop'} />
      ) : (
        <>
          {(DRAWINGS[kind] || DRAWINGS.box)(c)}
          {name && (
            <text x="200" y="345" textAnchor="middle" fill="var(--color-brand-charcoal)" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize="34">
              {name}
            </text>
          )}
        </>
      )}
    </svg>
  )
}
