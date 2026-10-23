import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SiteLink from '../components/SiteLink'
import { SITE_URL, applyPageMeta, canonicalUrl, postMeta } from '../pageMeta'
import { assetUrl } from '../api'
import { postPath } from '../productSlug'
import usePosts from '../usePosts'
import { formatPostDate } from './News'

const absolute = (url) => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`)

export default function NewsPost() {
  const { id } = useParams()
  const { posts, loaded } = usePosts()
  const post = posts.find((p) => String(p.id) === id) || null

  useEffect(() => {
    if (post) applyPageMeta({ ...postMeta(post), path: postPath(post) })
    else if (loaded) applyPageMeta({ title: 'News not found | DECODE IT Solutions', description: 'This news post is no longer available.', noindex: true })
  }, [post, loaded])

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand-charcoal">{loaded ? 'This post is no longer available' : 'Loading…'}</h1>
        <SiteLink to="/news" className="mt-4 inline-block font-semibold text-brand-charcoal underline">Back to all news</SiteLink>
      </div>
    )
  }

  // "<" is escaped so the JSON can never close the surrounding script tag.
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: canonicalUrl(postPath(post)),
    ...(post.image ? { image: absolute(assetUrl(post.image)) } : {}),
    author: { '@type': 'Organization', name: 'DECODE IT Solutions' },
    publisher: { '@type': 'Organization', name: 'DECODE IT Solutions' },
  }).replace(/</g, '\u003c')
  const paragraphs = String(post.body || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return (
    <article className="min-h-screen bg-gray-50 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <SiteLink to="/news" className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-charcoal">
          <ArrowLeft size={16} aria-hidden="true" /> All news
        </SiteLink>
        <p className="mt-6 text-sm font-medium uppercase tracking-wide text-gray-500">{formatPostDate(post.publishedAt)}</p>
        <h1 className="mt-1 text-3xl font-bold text-brand-charcoal md:text-4xl">{post.title}</h1>
        {post.image && <img src={assetUrl(post.image)} alt="" className="mt-6 w-full rounded-xl object-cover shadow-md" />}
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-gray-700">
          {paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line">{text}</p>)}
        </div>
      </div>
    </article>
  )
}
