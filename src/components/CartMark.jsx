// The shop's cart icon (also the favicon, public/favicon.svg): a green cart with the logo's </> in the basket.
export default function CartMark({ size = 24, className = '' }) {
  return (
    <svg viewBox="0 0 320 320" width={size} height={size} className={className} aria-hidden="true">
      <path d="M88 92H274Q292 92 288 110L276 162Q272 178 256 178H108Z" fill="#fff" />
      <g fill="none" stroke="#1d9e80" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 40H62Q76 40 79 54L112 196Q115 210 130 210H270" />
        <path d="M88 92H274Q292 92 288 110L276 162Q272 178 256 178H108" />
      </g>
      <circle cx="138" cy="262" r="26" fill="#1d9e80" />
      <circle cx="246" cy="262" r="26" fill="#1d9e80" />
      <circle cx="138" cy="262" r="8" fill="#fff" />
      <circle cx="246" cy="262" r="8" fill="#fff" />
      <g fill="none" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <path d="M162 116L144 135L162 154" stroke="var(--color-brand-teal)" />
        <path d="M190 112L177 158" stroke="var(--color-brand-grey)" />
        <path d="M206 116L224 135L206 154" stroke="var(--color-brand-indigo)" />
      </g>
    </svg>
  )
}
