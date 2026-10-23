import { ArrowRight, Eye, Handshake, Lightbulb, MessagesSquare, PackageCheck, Rocket, Target, Wrench } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SiteLink from '../components/SiteLink'
import { groupBrands } from '../brands'
import { categoryPath, groupCategories } from '../categories'
import useProducts from '../useProducts'
import { SITE_NAME, TAGLINE } from '../siteDefaults'
import PARTNER_LOGOS from '../data/partnerLogos'

// How a job runs, shown as three steps. Edit the wording here.
const STEPS = [
  { icon: MessagesSquare, title: 'Tell us what you need', text: 'Message us on WhatsApp, call or visit. We ask a few questions about how you will use it.' },
  { icon: PackageCheck, title: 'Get the right solution', text: 'A product that fits your budget, a repair quote, or a plan for your website or till, with the price confirmed up front.' },
  { icon: Wrench, title: 'Stay supported', text: 'Delivery or pickup, setup help, maintenance and support after the job is done.' },
]

const VALUES = [
  { icon: Eye, title: 'Our vision', text: 'To be the IT shop Nairobi homes and businesses call first, whatever the problem.' },
  { icon: Target, title: 'Our mission', text: 'To deliver efficient computing and digital solutions at a fair price, with support that lasts.' },
  { icon: Handshake, title: 'Integrity', text: 'Honest advice, genuine parts and no surprises on the bill.' },
  { icon: Lightbulb, title: 'Innovation', text: 'From Linux installs to POS systems, we keep our customers on technology that works.' },
]

export default function About() {
  // The figures and the "What we do" list follow the catalogue.
  const products = useProducts().filter(product => product.active !== false && product.inCatalog !== false)
  const brands = groupBrands(products)
  const categoryGroups = groupCategories(products)

  return (
    <div className="bg-white">
      <PageHeader eyebrow="About us" title={SITE_NAME} intro={TAGLINE} />

      {/* Who we are + figures */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Nairobi's all-round IT stop</h2>
            <p className="mt-5 text-gray-600">
              {SITE_NAME} sells and repairs laptops and desktops, stocks computer and mobile accessories from brands like Vention, Netac, Lexar and Oraimo, and builds websites and point-of-sale systems for small businesses. We also handle virus removal, data recovery, networking, graphic design and Linux installs.
            </p>
            <p className="mt-4 text-gray-600">
              Visit us at Ridge House, 1st Floor, Stall 4, Munyu Road off Accra Road, or order on WhatsApp. {SITE_NAME} is part of NT Group by Nemsey Traders Ltd.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 self-center">
            {[
              { value: products.length, label: 'Products online', none: 'No products added yet' },
              { value: categoryGroups.length, label: 'Categories', none: 'No categories added yet' },
              { value: Math.max(brands.length, PARTNER_LOGOS.length), label: 'Brands we supply' },
              { value: 'Accra Rd', label: 'Find us in Nairobi' },
            ].map(({ value, label, none }) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-6">
                <dt className="text-sm text-gray-500">{label}</dt>
                {value === 0 && none
                  ? <dd className="mt-2 text-sm font-medium text-gray-400">{none}</dd>
                  : <dd className="mt-1 font-heading text-4xl font-bold text-brand-charcoal">{value}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow">How we work</p>
          <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Three simple steps</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-charcoal font-heading font-bold text-white">{index + 1}</span>
                  <Icon size={22} className="text-brand-ember" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-brand-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we do: the catalogue's categories */}
      {categoryGroups.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="eyebrow">What we do</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-charcoal md:text-4xl">Our product range</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {categoryGroups.map((group) => (
                <SiteLink
                  key={group.slug}
                  to={categoryPath(group.name)}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-brand-charcoal transition-colors hover:border-brand-yellow hover:bg-brand-yellow/10"
                >
                  {group.name} <span className="text-gray-400">· {group.products.length}</span>
                </SiteLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vision, mission, values */}
      <section className="border-t border-slate-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow">What drives us</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-l-4 border-brand-yellow pl-5">
                <Icon size={24} className="text-brand-blue" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-brand-charcoal">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-brand-charcoal to-brand-blue px-8 py-10 text-white md:flex-row md:items-center md:px-12">
            <div className="flex items-center gap-4">
              <Rocket size={32} className="text-brand-yellow" aria-hidden="true" />
              <h2 className="text-2xl font-bold md:text-3xl">Let's sort out your setup.</h2>
            </div>
            <SiteLink to="/contact" className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-7 py-3.5 font-bold text-brand-charcoal transition-colors hover:bg-brand-orange">
              Talk to us <ArrowRight size={18} aria-hidden="true" />
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  )
}
