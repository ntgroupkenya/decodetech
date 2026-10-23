import { useState } from 'react'

// "Shop by brand": the brands' own logos in their own colours (public/brands/*.svg), busiest brands first.
// Most come from Simple Icons and the SVG Logos collection (both free to use; the trademarks stay with their owners); the PNGs
// (UGREEN, Grandstream, NEC, APC, Crucial, Tripp Lite, Kingston) are from Brands of the World. Vention, Dahua and Netac are
// redrawn in their logo colours.
// `filter` is the shop filter a click sets: a brand from the stock list, or a search for makers that only appear in names.
// A logo hides itself while no product in the shop matches it. Large screens show one row (ROW logos) until "All brands" is
// pressed; phones scroll the whole row sideways.
const BRANDS = [
  { file: 'ugreen.png', label: 'UGREEN', filter: ['brand', 'UGREEN'] },
  { file: 'hp.svg', label: 'HP', filter: ['brand', 'HP'] },
  { file: 'dahua.svg', label: 'Dahua', filter: ['brand', 'Dahua'] },
  { file: 'vention.svg', label: 'Vention', filter: ['brand', 'Vention'] },
  { file: 'logitech.svg', label: 'Logitech', filter: ['brand', 'Logitech'] },
  { file: 'xiaomi.svg', label: 'Xiaomi', filter: ['brand', 'Xiaomi'] },
  { file: 'lenovo.svg', label: 'Lenovo', filter: ['brand', 'Lenovo'] },
  { file: 'panasonic.svg', label: 'Panasonic', filter: ['brand', 'Panasonic'] },
  { file: 'dell.svg', label: 'Dell', filter: ['brand', 'Dell'] },
  { file: 'asus.svg', label: 'ASUS', filter: ['brand', 'ASUS'] },
  { file: 'apple.svg', label: 'Apple', filter: ['brand', 'Apple'] },
  { file: 'sandisk.svg', label: 'SanDisk', filter: ['brand', 'SanDisk'] },
  { file: 'jbl.svg', label: 'JBL', filter: ['brand', 'JBL'] },
  { file: 'msi.svg', label: 'MSI', filter: ['brand', 'MSI'] },
  { file: 'nvidia.svg', label: 'NVIDIA', filter: ['q', 'nvidia'] },
  { file: 'epson.svg', label: 'Epson', filter: ['brand', 'Epson'] },
  { file: 'grandstream.png', label: 'Grandstream', filter: ['brand', 'Grandstream'] },
  { file: 'wd.svg', label: 'WD', filter: ['brand', 'WD'] },
  { file: 'microsoft.svg', label: 'Microsoft', filter: ['brand', 'Microsoft'] },
  { file: 'samsung.svg', label: 'Samsung', filter: ['brand', 'Samsung'] },
  { file: 'amd.svg', label: 'AMD', filter: ['brand', 'AMD'] },
  { file: 'intel.svg', label: 'Intel', filter: ['brand', 'Intel'] },
  { file: 'toshiba.svg', label: 'Toshiba', filter: ['brand', 'Toshiba'] },
  { file: 'tplink.svg', label: 'TP-Link', filter: ['brand', 'TP-Link'] },
  { file: 'netac.svg', label: 'Netac', filter: ['brand', 'Netac'] },
  { file: 'acer.svg', label: 'Acer', filter: ['brand', 'Acer'] },
  { file: 'nec.png', label: 'NEC', filter: ['brand', 'NEC'] },
  { file: 'apc.png', label: 'APC', filter: ['brand', 'APC'] },
  { file: 'crucial.png', label: 'Crucial', filter: ['brand', 'Crucial'] },
  { file: 'tripp-lite.png', label: 'Tripp Lite', filter: ['brand', 'Tripp Lite'] },
  { file: 'kingston.png', label: 'Kingston', filter: ['brand', 'Kingston'] },
]

const ROW = 10

const matches = ([key, value], product) =>
  key === 'brand'
    ? product.brand === value
    : [product.name, product.brand, product.specs].some((field) => String(field || '').toLowerCase().includes(value))

export default function BrandStrip({ products, active, onPick }) {
  const [expanded, setExpanded] = useState(false)
  const shown = BRANDS.filter((brand) => products.some((product) => matches(brand.filter, product)))
  if (shown.length === 0) return null
  const hiddenCount = shown.length - ROW

  return (
    <section aria-label="Shop by brand" className="rounded-md border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <p className="code-label">shop by brand</p>
        {hiddenCount > 0 && (
          <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="hidden text-xs font-semibold text-brand-primary-dark hover:underline lg:block">
            {expanded ? 'Fewer brands' : `All brands (+${hiddenCount})`}
          </button>
        )}
      </div>
      <ul className={`no-scrollbar mt-2 flex items-center gap-1 overflow-x-auto lg:justify-between lg:overflow-visible ${expanded ? 'lg:flex-wrap lg:justify-center' : ''}`}>
        {shown.map(({ file, label, filter }, index) => {
          const isActive = active[0] === filter[0] && active[1] === filter[1]
          return (
            <li key={file} className={`shrink-0 ${index >= ROW && !expanded && !isActive ? 'lg:hidden' : ''}`}>
              <button
                type="button"
                onClick={() => onPick(filter)}
                aria-pressed={isActive}
                title={`Shop ${label}`}
                className={`flex h-12 items-center rounded-md border px-2.5 transition-colors ${isActive ? 'border-brand-primary bg-brand-primary/5' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <img src={`${import.meta.env.BASE_URL}brands/${file}`} alt={label} loading="lazy" className="h-6 w-auto max-w-[6rem] object-contain" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
