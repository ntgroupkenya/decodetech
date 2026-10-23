import { ArrowRight, ArrowUpRight, CheckCircle2, Cpu, DatabaseBackup, Globe, Headphones, LayoutGrid, Laptop, MessageCircle, Network, PackageOpen, Palette, Receipt, ShieldCheck, ShieldPlus, Truck, Wrench } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import SiteLink from '../components/SiteLink'
import LogoMarquee from '../components/LogoMarquee'
import { useSiteSettings } from '../siteSettings'
import { assetUrl } from '../api'
import { brandProductsPath, groupBrands } from '../brands'
import { categoryPath, groupCategories } from '../categories'
import { productPath } from '../productSlug'
import useProducts from '../useProducts'
import { SITE_NAME } from '../siteDefaults'

// Services, shown as cards under the hero. Edit the wording here.
const SERVICES = [
  { icon: Laptop, title: 'Computer sales & repairs', text: 'New and refurbished laptops and desktops, plus tune-ups, upgrades and fresh installations.' },
  { icon: Wrench, title: 'Hardware repair', text: 'Broken screens, keyboards, ports and chargers fixed, and parts installed or replaced.' },
  { icon: ShieldPlus, title: 'Virus removal', text: 'Viruses and malware cleaned off without losing your files.' },
  { icon: DatabaseBackup, title: 'Data backup & recovery', text: 'Files rescued from crashed drives and infected machines, and backups set up so it does not happen again.' },
  { icon: Network, title: 'Network troubleshooting', text: 'Wi-Fi and wired networks set up and fixed for homes and offices.' },
  { icon: Globe, title: 'Website development', text: 'Websites and web apps built, hosted and looked after, and broken sites repaired.' },
  { icon: Receipt, title: 'Point of sale systems', text: 'NTMart POS and NTmart Go for shops, with receipt printers and the rest of the hardware.' },
  { icon: Palette, title: 'Graphic design & video', text: 'Logos, posters and video editing with the Adobe Creative Suite.' },
]

// "Why DECODE" points, shown as numbered cards. Edit the wording here.
const REASONS = [
  { icon: ShieldCheck, title: 'Genuine products', text: 'Original, warrantied computers and accessories from brands that stand behind them.' },
  { icon: Headphones, title: 'One stop for IT', text: 'Sales, repairs, websites and shop systems under one roof, so you only need one number.' },
  { icon: Truck, title: 'Fast turnaround', text: 'Quick repairs and quick delivery or pickup, confirmed with you on WhatsApp.' },
  { icon: Cpu, title: 'Support after the sale', text: 'Setup help, maintenance and Linux support long after you leave the shop.' },
]

// Shop-by-brand tiles (photos in public/brands/). span sets the tile size in the 4-column grid.
const BRAND_TILES = [
  { brand: 'ASUS', title: 'ROG gaming laptops', image: '/brands/asus-rog.jpg', span: 'sm:col-span-2 lg:row-span-2' },
  { brand: 'Microsoft', title: 'Surface laptops', image: '/brands/microsoft-surface.jpg', span: 'sm:col-span-2', position: 'object-[50%_75%]' },
  { brand: 'Apple', title: 'MacBook', image: '/brands/apple-macbook.jpg', span: '' },
  { brand: 'HP', title: 'Pavilion', image: '/brands/hp-pavilion.jpg', span: '' },
  { brand: 'Lenovo', title: 'IdeaPad & ThinkPad', image: '/brands/lenovo-ideapad.jpg', span: 'sm:col-span-2' },
  { brand: 'ASUS', title: 'VivoBook', image: '/brands/asus-vivobook.jpg', span: 'sm:col-span-2' },
]

export default function Home() {
  const { whatsappUrl } = useSiteSettings()

  // Figures, categories, partners and featured products all come from the catalogue.
  const products = useProducts().filter(product => product.active !== false && product.inCatalog !== false)
  const brands = groupBrands(products)
  const categoryGroups = groupCategories(products)
  // Hot products first, then the rest; only products with a photo.
  const featured = [...products.filter(p => p.hot), ...products.filter(p => !p.hot)]
    .filter(product => product.image)
    .slice(0, 4)

  const stats = [
    { value: products.length, label: 'Products online' },
    { value: categoryGroups.length, label: 'Categories' },
    { value: brands.length, label: 'Brands' },
  ]

  return (
    <div className="bg-white">
      {/* Hero: text on the left, the devices image with live figures on the right */}
      <section className="page-hero overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.15fr] lg:px-8">
          <div>
            <p className="eyebrow">{SITE_NAME}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-brand-charcoal md:text-6xl">
              Computing, <span className="text-brand-ember">made easy</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-gray-600">
              Computer sales and repairs, accessories, websites and point-of-sale systems: your all-round IT shop at Ridge House, off Accra Road, Nairobi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SiteLink to="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-7 py-3.5 font-bold text-brand-charcoal transition-colors hover:bg-brand-orange">
                Explore products <ArrowRight size={18} aria-hidden="true" />
              </SiteLink>
              <SiteLink to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-charcoal px-7 py-3.5 font-bold text-brand-charcoal transition-colors hover:bg-brand-charcoal hover:text-white">
                Get a free consultation
              </SiteLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              {['Sales & repairs', 'Websites & POS', 'Order on WhatsApp'].map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-blue" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>

          {/* Devices image on a brand backdrop, with floating badges */}
          <div className="relative mx-auto w-full max-w-2xl lg:-mr-8">
            <div aria-hidden="true" className="hero-backdrop absolute inset-x-[4%] inset-y-[2%] rounded-full" />
            <svg aria-hidden="true" className="absolute -left-2 top-6 h-24 w-40 sm:h-28 sm:w-48" viewBox="0 0 200 110" fill="none" strokeWidth="4" strokeLinecap="round">
              <path d="M4 20h90l18-14h40" stroke="#48c0b0" /><circle cx="160" cy="6" r="5" stroke="#48c0b0" />
              <path d="M4 48h120" stroke="#48c0b0" /><circle cx="132" cy="48" r="5" stroke="#48c0b0" />
              <path d="M4 76h70l18 18h40" stroke="#5060a8" /><circle cx="140" cy="94" r="5" stroke="#5060a8" />
            </svg>
            <img
              src="/hero-devices.png"
              alt="Desktop computer, laptop, keyboard and mouse"
              width="860"
              height="538"
              fetchPriority="high"
              className="hero-float relative w-full drop-shadow-2xl"
            />

            <div className="hero-float absolute left-0 top-[58%] hidden items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur sm:flex" style={{ animationDelay: '-2s' }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-ember"><ShieldCheck size={22} aria-hidden="true" /></span>
              <span>
                <span className="block text-sm font-semibold text-brand-charcoal">Sales & repairs</span>
                <span className="block text-xs text-gray-500">Laptops, desktops & accessories</span>
              </span>
            </div>

            {products.length > 0 ? (
              <div className="hero-float absolute -bottom-4 right-2 flex divide-x divide-slate-200 rounded-2xl bg-white/95 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur sm:right-6" style={{ animationDelay: '-4s' }}>
                {stats.map(({ value, label }) => (
                  <div key={label} className="px-4 text-center">
                    <p className="font-heading text-2xl font-bold text-brand-charcoal">{value}</p>
                    <p className="text-[0.65rem] uppercase tracking-wide text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hero-float absolute -bottom-4 right-2 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur sm:right-6" style={{ animationDelay: '-4s' }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue"><PackageOpen size={20} aria-hidden="true" /></span>
                <span>
                  <span className="block text-sm font-semibold text-brand-charcoal">No products added yet</span>
                  <span className="block text-xs text-gray-500">Ask us on WhatsApp for today's stock</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services: one card per service in SERVICES */}
      <section className="border-b border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">What we do</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">One shop for everything your setup needs</h2>
            <p className="mt-3 text-gray-600">A laptop that needs saving, a shop that needs a till or a business that needs a website: it is all handled under one roof.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-charcoal"><Icon size={22} aria-hidden="true" /></span>
                <h3 className="mt-4 font-semibold text-brand-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands we supply: two rows of logos scrolling in opposite directions (list in src/data/partnerLogos.js) */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="eyebrow justify-center">Brands we supply</p>
          <h2 className="mt-3 text-2xl font-bold text-brand-charcoal md:text-3xl">The names you trust, from one supplier</h2>
        </div>
        <div className="mt-10">
          <LogoMarquee />
        </div>
      </section>

      {/* What we offer: one tile per category in the catalogue */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">What we offer</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Solutions for every need</h2>
            </div>
            <SiteLink to="/products" className="inline-flex items-center gap-2 font-semibold text-brand-charcoal hover:text-brand-ember">
              View the full catalogue <ArrowRight size={16} aria-hidden="true" />
            </SiteLink>
          </div>
          {categoryGroups.length === 0 && (
            <div className="mt-10">
              <EmptyState icon={LayoutGrid} compact title="No categories added yet" text="Laptops, desktops and accessories categories will appear here as products are added." />
            </div>
          )}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 empty:hidden">
            {categoryGroups.map((group, index) => (
              <SiteLink
                key={group.slug}
                to={categoryPath(group.name)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-yellow hover:shadow-md"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold ${index % 2 ? 'bg-brand-yellow/15 text-brand-ember' : 'bg-brand-blue/10 text-brand-blue'}`}>
                  {group.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-brand-charcoal">{group.name}</span>
                  <span className="block text-sm text-gray-500">{group.products.length} product{group.products.length === 1 ? '' : 's'}</span>
                </span>
                <ArrowUpRight size={20} className="shrink-0 text-gray-400 transition-colors group-hover:text-brand-ember" aria-hidden="true" />
              </SiteLink>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by brand: lifestyle photos in a bento grid, each opening that brand in the catalogue */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Shop by brand</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Find your next laptop</h2>
            </div>
            <SiteLink to="/brands" className="inline-flex items-center gap-2 font-semibold text-brand-charcoal hover:text-brand-ember">
              All brands <ArrowRight size={16} aria-hidden="true" />
            </SiteLink>
          </div>
          <div className="mt-10 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_TILES.map(({ brand, title, image, span, position = 'object-center' }) => (
              <SiteLink
                key={image}
                to={brandProductsPath(brand)}
                className={`group relative overflow-hidden rounded-3xl bg-slate-900 ${span}`}
              >
                <img src={image} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${position} transition-transform duration-500 group-hover:scale-105`} />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-black/85 via-brand-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-brand-yellow">{brand}</span>
                    <span className="mt-1 block font-heading text-xl font-bold text-white md:text-2xl">{title}</span>
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-brand-yellow group-hover:text-brand-charcoal">
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </span>
              </SiteLink>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="eyebrow">Popular right now</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Featured products</h2>
            <div className="mt-10 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {featured.map((product) => (
                <SiteLink
                  key={product.id}
                  to={productPath(product)}
                  className="group w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition-shadow hover:shadow-lg sm:w-auto"
                >
                  <div className="aspect-[4/3] bg-white p-4">
                    <img src={assetUrl(product.image)} alt={product.name} loading="lazy" className="h-full w-full object-contain" />
                  </div>
                  <div className="border-t border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">{product.categoryName || product.category}</p>
                    <h3 className="mt-1 line-clamp-2 font-semibold text-brand-charcoal group-hover:text-brand-ember">{product.name}</h3>
                  </div>
                </SiteLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why DECODE: numbered cards */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Why DECODE</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Technology you can rely on, people you can reach</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="relative rounded-2xl border border-slate-200 p-6">
                <span className="absolute right-5 top-4 font-heading text-4xl font-bold text-slate-100" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={28} className="relative text-brand-ember" aria-hidden="true" />
                <h3 className="relative mt-4 text-lg font-semibold text-brand-charcoal">{title}</h3>
                <p className="relative mt-2 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories: a quiet strip for Vention docks, hubs and switches (photos in public/brands/) */}
      <section className="pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 md:grid-cols-[1fr_1.2fr] md:p-10">
            <div>
              <p className="eyebrow">Accessories</p>
              <h2 className="mt-3 text-2xl font-bold text-brand-charcoal md:text-3xl">The finishing touches</h2>
              <p className="mt-3 text-gray-600">
                Docking stations, USB-C hubs, HDMI switches and cables that turn one laptop into a full workstation.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <SiteLink to={brandProductsPath('Vention')} className="inline-flex items-center gap-2 font-semibold text-brand-charcoal hover:text-brand-ember">
                  Browse accessories <ArrowRight size={16} aria-hidden="true" />
                </SiteLink>
                <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                  Featuring <img src="/logos/vention.png" alt="Vention" width="1090" height="120" loading="lazy" className="h-3.5 w-auto opacity-80" />
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[1.35fr_1fr] gap-4">
              <img src="/brands/vention-dock.jpg" alt="Vention 12-in-1 docking station under a laptop" width="800" height="585" loading="lazy" className="h-48 w-full rounded-2xl object-cover object-bottom sm:h-56" />
              <img src="/brands/vention-hdmi-switch.jpg" alt="Vention HDMI switch with gold-plated ports" width="700" height="700" loading="lazy" className="h-48 w-full rounded-2xl object-cover object-right sm:h-56" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-charcoal to-brand-blue px-8 py-12 text-white md:px-14">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-yellow/20 blur-2xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold md:text-4xl">Let's sort out your setup.</h2>
                <p className="mt-3 text-blue-100">Sales, repairs, a website or a till for your shop: tell us what you need and get a quote, usually within minutes.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-7 py-3.5 font-bold text-brand-charcoal transition-colors hover:bg-brand-orange">
                  <MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp
                </a>
                <SiteLink to="/about" className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white hover:text-brand-charcoal">
                  About DECODE
                </SiteLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
