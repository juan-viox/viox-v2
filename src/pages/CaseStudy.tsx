import { Link, useRoute, useLocation } from 'wouter'
import { ArrowLeft, ArrowUpRight, ArrowRight } from 'lucide-react'
import SEO from '@/components/SEO'
import CTABanner from '@/components/CTABanner'
import { CASE_STUDIES, type CaseStudy as CaseStudyType } from '@/config/case-studies'
import { caseStudyNode, breadcrumbs } from '@/lib/jsonld'

export default function CaseStudy() {
  const [, params] = useRoute<{ slug: string }>('/work/:slug')
  const [, setLocation] = useLocation()
  const slug = params?.slug
  const c = CASE_STUDIES.find((x) => x.slug === slug)

  if (!c) {
    // Soft 404 — render an obvious miss state. Crawlers see noindex.
    return (
      <>
        <SEO title="Not found — VioX AI" path={`/work/${slug ?? ''}`} noindex />
        <section className="section-tight" style={{ paddingTop: 'calc(64px + var(--sp-16))' }}>
          <div className="container-page">
            <span className="t-eyebrow">404</span>
            <h1 className="t-h1" style={{ marginTop: 'var(--sp-3)' }}>Project not found.</h1>
            <p className="t-body" style={{ marginTop: 'var(--sp-4)', maxWidth: 560 }}>
              That case study doesn't exist, or it was renamed. Browse all selected work below.
            </p>
            <button onClick={() => setLocation('/work')} className="btn btn-primary" style={{ marginTop: 'var(--sp-8)' }}>
              <ArrowLeft size={16} /> All projects
            </button>
          </div>
        </section>
      </>
    )
  }

  const idx = CASE_STUDIES.findIndex((x) => x.slug === c.slug)
  const prev = CASE_STUDIES[(idx - 1 + CASE_STUDIES.length) % CASE_STUDIES.length]
  const next = CASE_STUDIES[(idx + 1) % CASE_STUDIES.length]

  return (
    <>
      <SEO
        title={`${c.name} — VioX AI`}
        description={`${c.headline}. ${c.description}`}
        path={`/work/${c.slug}`}
        image={`/og/work-${c.slug}.png`}
        type="article"
        jsonLd={[
          caseStudyNode(c),
          {
            '@context': 'https://schema.org',
            ...breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Work', path: '/work' },
              { name: c.name, path: `/work/${c.slug}` },
            ]),
          },
        ]}
      />

      {/* Hero */}
      <header
        className="section-tight"
        style={{ paddingTop: 'calc(64px + var(--sp-16))', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="container-page">
          <Link
            href="/work"
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
            <ArrowLeft size={14} /> Back to all work
          </Link>

          <div
            className="flex items-baseline justify-between flex-wrap"
            style={{ gap: 'var(--sp-4)' }}
          >
            <span className="t-eyebrow">{c.industry} · {c.location}</span>
            <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
              {c.year}
            </span>
          </div>

          <h1
            style={{
              marginTop: 'var(--sp-4)',
              fontWeight: 800,
              fontSize: 'clamp(40px, 6vw, 88px)',
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              maxWidth: '18ch',
            }}
          >
            {c.name}
          </h1>

          <p style={{
            marginTop: 'var(--sp-6)',
            fontSize: 'var(--fs-lg)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            maxWidth: 720,
            letterSpacing: '-0.01em',
          }}>
            {c.headline}
          </p>
        </div>
      </header>

      {/* Body */}
      <section className="section">
        <div className="container-page">
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              gap: 'var(--sp-16)',
              alignItems: 'start',
            }}
          >
            <div>
              <span className="section-num">/ Brief</span>
              <p className="t-body" style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--fs-md)' }}>
                {c.description}
              </p>

              <div style={{ marginTop: 'var(--sp-12)' }}>
                <span className="section-num">/ Services</span>
                <ul style={{
                  marginTop: 'var(--sp-4)',
                  listStyle: 'none',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--sp-2)',
                }}>
                  {c.services.map((s) => (
                    <li key={s} className="t-mono" style={{
                      fontSize: 'var(--fs-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '8px 14px',
                      borderRadius: 999,
                      background: 'var(--color-brand-soft)',
                      color: 'var(--color-brand)',
                      fontWeight: 600,
                    }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidecar metric */}
            <aside className="card" style={{ position: 'sticky', top: 96 }}>
              <span className="t-eyebrow">Outcome</span>
              <div style={{
                marginTop: 'var(--sp-4)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: 'clamp(56px, 6vw, 96px)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {c.metric}
              </div>
              <div className="stat-label">{c.metricLabel}</div>

              {c.liveUrl && (
                <a
                  href={c.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--sp-8)', width: '100%' }}
                >
                  Visit live site <ArrowUpRight size={14} />
                </a>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Prev / next nav */}
      <section className="section-tight surface-elevated" style={{ borderBlock: '1px solid var(--border-subtle)' }}>
        <div className="container-page">
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--sp-6)' }}
          >
            <CaseNav dir="prev" c={prev} />
            <CaseNav dir="next" c={next} />
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  )
}

function CaseNav({ dir, c }: { dir: 'prev' | 'next'; c: CaseStudyType }) {
  const isNext = dir === 'next'
  return (
    <Link
      href={`/work/${c.slug}`}
      className="card"
      style={{
        textDecoration: 'none',
        textAlign: isNext ? 'right' : 'left',
      }}
    >
      <span className="t-eyebrow">{isNext ? 'Next' : 'Previous'} project</span>
      <h3 className="t-h3" style={{ marginTop: 'var(--sp-3)' }}>{c.name}</h3>
      <p style={{
        marginTop: 'var(--sp-2)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--text-secondary)',
      }}>
        {c.industry} · {c.location}
      </p>
      <span style={{
        marginTop: 'var(--sp-4)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--color-brand)',
        fontWeight: 600,
      }}>
        {isNext ? <>View case study <ArrowRight size={14} /></> : <><ArrowLeft size={14} /> View case study</>}
      </span>
    </Link>
  )
}
