// "Shop by brand": the brands' logos in one colour (public/brands/*.svg, drawn with currentColor). Each logo is used as a
// CSS mask over a coloured box, so it takes the theme's grey and turns indigo on hover or when its brand is picked.
// `filter` is the shop filter a click sets: a brand from the stock list, or a search for makers that only appear in names.
// `ratio` is the logo's width over its height. A logo hides itself while no product in the shop matches it.
const BRANDS = [
  { file: 'hp', label: 'HP', ratio: 1, filter: ['brand', 'HP'] },
  { file: 'lenovo', label: 'Lenovo', ratio: 3.57, filter: ['brand', 'Lenovo'] },
  { file: 'dahua', label: 'Dahua', ratio: 2.49, filter: ['brand', 'Dahua'] },
  { file: 'vention', label: 'Vention', ratio: 6.9, filter: ['brand', 'Vention'] },
  { file: 'microsoft', label: 'Microsoft', ratio: 5.73, filter: ['brand', 'Microsoft'] },
  { file: 'nvidia', label: 'NVIDIA', ratio: 1.87, filter: ['q', 'nvidia'] },
  { file: 'amd', label: 'AMD Radeon', ratio: 3.37, filter: ['brand', 'AMD'] },
  { file: 'toshiba', label: 'Toshiba', ratio: 8.79, filter: ['brand', 'Toshiba'] },
  { file: 'netac', label: 'Netac', ratio: 3.83, filter: ['brand', 'Netac'] },
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
      <ul className="no-scrollbar mt-2 flex items-center gap-1 overflow-x-auto lg:justify-between">
        {shown.map(({ file, label, ratio, filter }) => {
          const url = `url(${import.meta.env.BASE_URL}brands/${file}.svg)`
          const isActive = active[0] === filter[0] && active[1] === filter[1]
          return (
            <li key={file} className="shrink-0">
              <button
                type="button"
                onClick={() => onPick(filter)}
                aria-pressed={isActive}
                title={`Shop ${label}`}
                className={`flex h-14 items-center rounded-md px-3 transition-colors ${isActive ? 'bg-brand-indigo/10 text-brand-indigo' : 'text-brand-charcoal/45 hover:bg-gray-50 hover:text-brand-indigo'}`}
              >
                <span
                  role="img"
                  aria-label={label}
                  className="block h-7 bg-current"
                  style={{ width: `${ratio * 1.75}rem`, maxWidth: '7.5rem', maskImage: url, WebkitMaskImage: url, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
