// Left-aligned page header used by the inner pages: a small eyebrow label, the title (with an optional
// highlighted part) and an intro line. Extra content (buttons, stats) goes in children.
export default function PageHeader({ eyebrow, title, accent, intro, children }) {
  return (
    <section className="page-hero">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-brand-charcoal md:text-5xl">
          {title}
          {accent && <> <span className="text-brand-ember">{accent}</span></>}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-gray-600">{intro}</p>}
        {children}
      </div>
    </section>
  )
}
