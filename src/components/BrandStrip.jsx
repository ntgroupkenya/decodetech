// "Shop by brand": the brands' own logos in their own colours (public/brands/*.svg), busiest brands first.
// Most come from Simple Icons and the SVG Logos collection (both free to use; the trademarks stay with their owners).
// Vention, Dahua and Netac are not in either collection and are redrawn in their logo colours.
// `filter` is the shop filter a click sets: a brand from the stock list, or a search for makers that only appear in names.
// A logo hides itself while no product in the shop matches it.
const BRANDS = [
  { file: 'hp', label: 'HP', filter: ['brand', 'HP'] },
  { file: 'dahua', label: 'Dahua', filter: ['brand', 'Dahua'] },
  { file: 'vention', label: 'Vention', filter: ['brand', 'Vention'] },
  { file: 'logitech', label: 'Logitech', filter: ['brand', 'Logitech'] },
  { file: 'lenovo', label: 'Lenovo', filter: ['brand', 'Lenovo'] },
  { file: 'dell', label: 'Dell', filter: ['brand', 'Dell'] },
  { file: 'asus', label: 'ASUS', filter: ['brand', 'ASUS'] },
  { file: 'apple', label: 'Apple', filter: ['brand', 'Apple'] },
  { file: 'sandisk', label: 'SanDisk', filter: ['brand', 'SanDisk'] },
  { file: 'jbl', label: 'JBL', filter: ['brand', 'JBL'] },
  { file: 'msi', label: 'MSI', filter: ['brand', 'MSI'] },
  { file: 'nvidia', label: 'NVIDIA', filter: ['q', 'nvidia'] },
  { file: 'epson', label: 'Epson', filter: ['brand', 'Epson'] },
  { file: 'wd', label: 'WD', filter: ['brand', 'WD'] },
  { file: 'microsoft', label: 'Microsoft', filter: ['brand', 'Microsoft'] },
  { file: 'samsung', label: 'Samsung', filter: ['brand', 'Samsung'] },
  { file: 'amd', label: 'AMD', filter: ['brand', 'AMD'] },
  { file: 'intel', label: 'Intel', filter: ['brand', 'Intel'] },
  { file: 'toshiba', label: 'Toshiba', filter: ['brand', 'Toshiba'] },
  { file: 'tplink', label: 'TP-Link', filter: ['brand', 'TP-Link'] },
  { file: 'netac', label: 'Netac', filter: ['brand', 'Netac'] },
  { file: 'acer', label: 'Acer', filter: ['brand', 'Acer'] },
  { file: 'kingston', label: 'Kingston', filter: ['brand', 'Kingston'] },
]

const matches = ([key, value], product) =>
  key === 'brand'
    ? product.brand === value
    : [product.name, product.brand, product.specs].some((field) => String(field || '').toLowerCase().includes(value))

export default function BrandStrip({ products, active, onPick }) {
  const shown = BRANDS.filter((brand) => products.some((product) => matches(brand.filter, product)))
  if (shown.length === 0) return null

  return (
    <section aria-label="Shop by brand" className="rounded-md border border-gray-200 bg-white px-4 py-3">
      <p className="code-label">shop by brand</p>
      <ul className="no-scrollbar mt-2 flex items-center gap-1 overflow-x-auto lg:flex-wrap lg:justify-center lg:overflow-visible">
        {shown.map(({ file, label, filter }) => {
          const isActive = active[0] === filter[0] && active[1] === filter[1]
          return (
            <li key={file} className="shrink-0">
              <button
                type="button"
                onClick={() => onPick(filter)}
                aria-pressed={isActive}
                title={`Shop ${label}`}
                className={`flex h-12 items-center rounded-md border px-2.5 transition-colors ${isActive ? 'border-brand-indigo bg-brand-indigo/5' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <img src={`${import.meta.env.BASE_URL}brands/${file}.svg`} alt={label} loading="lazy" className="h-6 w-auto max-w-[6rem] object-contain" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
