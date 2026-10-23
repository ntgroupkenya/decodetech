// Small pill showing a product's condition (New, Refurbished, Used…) next to its brand.
const TONES = {
  new: 'bg-green-100 text-green-800',
  refurbished: 'bg-blue-100 text-blue-800',
  used: 'bg-amber-100 text-amber-800',
}

export default function ConditionTag({ condition }) {
  if (!condition) return null
  const key = Object.keys(TONES).find((k) => condition.toLowerCase().includes(k))
  return (
    <span className={`whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[0.68rem] font-semibold normal-case tracking-normal ${TONES[key] || 'bg-gray-100 text-gray-700'}`}>
      {condition}
    </span>
  )
}
