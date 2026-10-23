import { Newspaper } from 'lucide-react'
import SiteLink from '../components/SiteLink'
import { assetUrl } from '../api'
import { postPath } from '../productSlug'
import usePosts from '../usePosts'
import PageHeader from '../components/PageHeader'

// Fixed-zone formatting so the pre-rendered page and the browser always print the same date.
export const formatPostDate = (value) => {
  const date = new Date(`${String(value || '').slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default function News() {
  const { posts } = usePosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader eyebrow="Insights" title="News &" accent="updates" intro="New arrivals, offers, tech tips and announcements from DECODE IT Solutions." />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Newspaper size={40} className="mx-auto mb-3 text-gray-400" aria-hidden="true" />
              <p className="text-lg">No news yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
                  {post.image && (
                    <SiteLink to={postPath(post)} className="block aspect-[16/9] overflow-hidden bg-gray-100" aria-label={post.title}>
                      <img src={assetUrl(post.image)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </SiteLink>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{formatPostDate(post.publishedAt)}</p>
                    <h2 className="mt-1 text-xl font-bold text-brand-charcoal">
                      <SiteLink to={postPath(post)} className="hover:underline">{post.title}</SiteLink>
                    </h2>
                    {post.summary && <p className="mt-2 flex-1 text-gray-600">{post.summary}</p>}
                    <SiteLink to={postPath(post)} className="mt-4 font-semibold text-brand-charcoal underline">Read more</SiteLink>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
