import { Link } from 'wouter'
import { ArrowRight } from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import CTABanner from '@/components/CTABanner'
import NewsletterSignup from '@/components/NewsletterSignup'
import { allPosts, formatDate } from '@/lib/blog'
import { breadcrumbs, organizationNode } from '@/lib/jsonld'

const SITE = 'https://www.viox.ai'

export default function Blog() {
  const posts = allPosts()
  const [featured, ...rest] = posts

  const blogGraph = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'VioX AI Blog',
    url: `${SITE}/blog`,
    publisher: organizationNode(),
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
      datePublished: p.date,
      dateModified: p.date,
      description: p.summary,
      author: { '@type': 'Organization', name: 'VioX AI' },
      keywords: p.tags.join(', '),
    })),
  }

  return (
    <>
      <SEO
        title="Blog — VioX AI"
        description="Frontier AI dispatches from VioX. Agentic systems, AI-first cloud, evals, voice agents — written by operators who ship them."
        path="/blog"
        image="/og/blog.png"
        jsonLd={[
          blogGraph,
          { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]) },
        ]}
      />

      <PageHeader
        eyebrow="Blog"
        title="Frontier AI dispatches from VioX."
        subtitle="Agentic systems, AI-first cloud, evals, voice agents — written by the operators who ship them."
      />

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container-page">
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="surface-inverted on-dark"
              style={{
                display: 'block',
                textDecoration: 'none',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(var(--sp-8), 4vw, var(--sp-16))',
                marginBottom: 'var(--sp-12)',
                color: 'var(--text-on-inverted)',
              }}
            >
              <div className="flex items-baseline justify-between flex-wrap" style={{ gap: 'var(--sp-4)' }}>
                <span className="t-mono" style={{
                  fontSize: 'var(--fs-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#67E8F9',
                  fontWeight: 600,
                }}>
                  Latest · {featured.category}
                </span>
                <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'rgba(244,242,247,0.55)' }}>
                  {formatDate(featured.date)} · {featured.readingMinutes} min
                </span>
              </div>

              <h2 style={{
                marginTop: 'var(--sp-6)',
                fontWeight: 800,
                fontSize: 'clamp(32px, 5vw, 64px)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                maxWidth: '20ch',
              }}>
                {featured.title}
              </h2>

              <p style={{
                marginTop: 'var(--sp-4)',
                fontSize: 'var(--fs-md)',
                color: 'rgba(255,255,255,0.78)',
                maxWidth: 720,
              }}>
                {featured.summary}
              </p>

              <div style={{
                marginTop: 'var(--sp-8)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                color: '#A78BFA',
                fontWeight: 600,
                fontSize: 'var(--fs-sm)',
              }}>
                Read full piece <ArrowRight size={14} />
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--sp-6)',
              }}
            >
              {rest.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="card"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', minHeight: 280 }}
                >
                  <div className="flex items-baseline justify-between" style={{ gap: 'var(--sp-2)' }}>
                    <span className="t-mono" style={{
                      fontSize: 'var(--fs-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--color-brand)',
                      fontWeight: 600,
                    }}>
                      {p.category}
                    </span>
                    <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                      {formatDate(p.date)}
                    </span>
                  </div>

                  <h3 className="t-h3" style={{ marginTop: 'var(--sp-3)' }}>{p.title}</h3>
                  <p className="t-body" style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--fs-sm)' }}>
                    {p.summary}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--sp-6)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                      {p.readingMinutes} min read
                    </span>
                    <span style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: 'var(--fs-sm)', display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      Read <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'var(--sp-16)', maxWidth: 640, marginInline: 'auto' }}>
            <NewsletterSignup />
          </div>

          <p className="t-mono" style={{
            marginTop: 'var(--sp-8)',
            fontSize: 'var(--fs-xs)',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
          }}>
            New articles daily · <a href="/feed.xml" style={{ color: 'var(--color-brand)' }}>RSS</a>
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  )
}
