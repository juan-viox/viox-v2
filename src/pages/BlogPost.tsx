import { Link, useRoute, useLocation } from 'wouter'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import SEO from '@/components/SEO'
import CTABanner from '@/components/CTABanner'
import { allPosts, getPost, formatDate } from '@/lib/blog'
import { breadcrumbs, organizationNode } from '@/lib/jsonld'

const SITE = 'https://www.viox.ai'

export default function BlogPost() {
  const [, params] = useRoute<{ slug: string }>('/blog/:slug')
  const [, setLocation] = useLocation()
  const slug = params?.slug
  const post = slug ? getPost(slug) : undefined

  if (!post) {
    return (
      <>
        <SEO title="Not found — VioX AI" path={`/blog/${slug ?? ''}`} noindex />
        <section className="section-tight" style={{ paddingTop: 'calc(64px + var(--sp-16))' }}>
          <div className="container-page">
            <span className="t-eyebrow">404</span>
            <h1 className="t-h1" style={{ marginTop: 'var(--sp-3)' }}>Article not found.</h1>
            <button onClick={() => setLocation('/blog')} className="btn btn-primary" style={{ marginTop: 'var(--sp-8)' }}>
              <ArrowLeft size={16} /> Back to blog
            </button>
          </div>
        </section>
      </>
    )
  }

  const all = allPosts()
  const idx = all.findIndex((p) => p.slug === post.slug)
  const prev = idx > 0 ? all[idx - 1] : null
  const next = idx < all.length - 1 ? all[idx + 1] : null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${post.slug}` },
    headline: post.title,
    description: post.summary,
    image: `${SITE}/og/blog-${post.slug}.png`,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'VioX AI', url: SITE },
    publisher: organizationNode(),
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: Math.round(post.readingMinutes * 220),
  }

  return (
    <>
      <SEO
        title={`${post.title} — VioX AI`}
        description={post.summary}
        path={`/blog/${post.slug}`}
        image={`/og/blog-${post.slug}.png`}
        type="article"
        jsonLd={[
          articleSchema,
          {
            '@context': 'https://schema.org',
            ...breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
          },
        ]}
      />

      <article>
        <header
          className="section-tight"
          style={{ paddingTop: 'calc(64px + var(--sp-16))', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="container-narrow">
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                fontSize: 'var(--fs-sm)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                marginBottom: 'var(--sp-8)',
              }}
            >
              <ArrowLeft size={14} /> All articles
            </Link>

            <span className="t-mono" style={{
              fontSize: 'var(--fs-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-brand)',
              fontWeight: 600,
            }}>
              {post.category}
            </span>

            <h1 style={{
              marginTop: 'var(--sp-4)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: '20ch',
            }}>
              {post.title}
            </h1>

            <p className="t-body" style={{ marginTop: 'var(--sp-6)', fontSize: 'var(--fs-md)', maxWidth: 640 }}>
              {post.summary}
            </p>

            <div className="flex flex-wrap" style={{ gap: 'var(--sp-6)', marginTop: 'var(--sp-6)', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                <Calendar size={14} /> {formatDate(post.date)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                <Clock size={14} /> {post.readingMinutes} min read
              </span>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap" style={{ gap: 'var(--sp-2)' }}>
                  {post.tags.slice(0, 4).map((t) => (
                    <span key={t} className="t-mono" style={{
                      fontSize: 'var(--fs-xs)',
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'var(--color-brand-soft)',
                      color: 'var(--color-brand)',
                      fontWeight: 600,
                      textTransform: 'lowercase',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="section-tight">
          <div className="container-narrow">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>
        </section>
      </article>

      {/* Prev / next nav */}
      {(prev || next) && (
        <section className="section-tight surface-elevated" style={{ borderBlock: '1px solid var(--border-subtle)' }}>
          <div className="container-page">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--sp-6)' }}>
              {prev ? <PostNav dir="prev" p={prev} /> : <div />}
              {next ? <PostNav dir="next" p={next} /> : <div />}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  )
}

function PostNav({ dir, p }: { dir: 'prev' | 'next'; p: ReturnType<typeof allPosts>[number] }) {
  const isNext = dir === 'next'
  return (
    <Link href={`/blog/${p.slug}`} className="card" style={{ textDecoration: 'none', textAlign: isNext ? 'right' : 'left' }}>
      <span className="t-eyebrow">{isNext ? 'Next' : 'Previous'}</span>
      <h3 className="t-h3" style={{ marginTop: 'var(--sp-3)' }}>{p.title}</h3>
      <span style={{ marginTop: 'var(--sp-4)', display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)', color: 'var(--color-brand)', fontWeight: 600 }}>
        {isNext ? <>Read <ArrowRight size={14} /></> : <><ArrowLeft size={14} /> Read</>}
      </span>
    </Link>
  )
}
