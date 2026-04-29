import { Link } from 'wouter'
import { ArrowRight } from 'lucide-react'
import { SOLUTIONS } from '@/config/services'

export default function SolutionsGrid() {
  const [hero, ...rest] = SOLUTIONS

  return (
    <section className="section" aria-labelledby="solutions-h">
      <div className="container-page">
        <div
          className="flex items-baseline justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}
        >
          <span className="section-num">/ 02 — What we ship</span>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            01 product · 04 services
          </span>
        </div>

        <h2 id="solutions-h" className="t-h1 x-rule" style={{ maxWidth: '14ch' }}>
          One product.<br />Four services.
        </h2>
        <p className="t-body" style={{ marginTop: 'var(--sp-8)', maxWidth: 580 }}>
          VioX OS is our productized agent operating system — the fastest way to deploy
          AI inside a business. Around it, we architect bespoke agentic systems, AI-first
          cloud platforms, integrations, and AI-first websites.
        </p>

        {/* Featured: VioX OS — full-width inverted card */}
        <div style={{ marginTop: 'var(--sp-16)' }}>
          <FeaturedSolution s={hero} />
        </div>

        {/* Rest: 4 cards in 2x2 (responsive auto-fit) */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--sp-6)',
            marginTop: 'var(--sp-6)',
          }}
        >
          {rest.map((s) => {
            const Icon = s.icon
            return (
              <article
                key={s.slug}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', minHeight: 360 }}
              >
                <div
                  style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-brand-soft)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-brand)',
                  }}
                  aria-hidden="true"
                >
                  <Icon size={26} strokeWidth={1.75} />
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--sp-12)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 800,
                    fontSize: 'clamp(56px, 7vw, 88px)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s.stat}
                </div>
                <div className="t-mono" style={{
                  fontSize: 'var(--fs-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--text-tertiary)',
                  marginTop: 'var(--sp-2)',
                }}>
                  {s.statLabel}
                </div>

                <div style={{
                  marginTop: 'var(--sp-8)',
                  paddingTop: 'var(--sp-6)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--sp-4)',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="t-h3">{s.name}</h3>
                    <p style={{
                      marginTop: 'var(--sp-2)',
                      fontSize: 'var(--fs-sm)',
                      color: 'var(--text-secondary)',
                    }}>
                      {s.outcome}
                    </p>
                  </div>
                  <Link
                    href="/services"
                    className="btn btn-ghost btn-sm"
                    aria-label={`Learn more about ${s.name}`}
                    style={{ flexShrink: 0 }}
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeaturedSolution({ s }: { s: typeof SOLUTIONS[number] }) {
  const Icon = s.icon
  return (
    <article
      className="surface-inverted on-dark"
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(var(--sp-8), 4vw, var(--sp-16))',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="flex items-start justify-between flex-wrap" style={{ gap: 'var(--sp-4)' }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)',
            background: 'rgba(124,58,237,0.18)',
            color: '#A78BFA',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <Icon size={26} strokeWidth={1.75} />
        </div>
        {s.badge && (
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: '#67E8F9',
            background: 'rgba(34,211,238,0.10)',
            border: '1px solid rgba(34,211,238,0.25)',
            padding: '6px 10px',
            borderRadius: 999,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}>
            {s.badge}
          </span>
        )}
      </div>

      <h3
        style={{
          marginTop: 'var(--sp-12)',
          fontWeight: 800,
          fontSize: 'clamp(40px, 5.5vw, 88px)',
          lineHeight: 0.96,
          letterSpacing: '-0.035em',
          color: '#FFFFFF',
          maxWidth: '14ch',
        }}
      >
        {s.outcome}
      </h3>

      <p style={{
        marginTop: 'var(--sp-6)',
        fontSize: 'var(--fs-md)',
        color: 'rgba(255,255,255,0.72)',
        maxWidth: 720,
      }}>
        {s.description}
      </p>

      <ul style={{
        marginTop: 'var(--sp-8)',
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--sp-3)',
      }}>
        {s.bullets.map((b) => (
          <li key={b} style={{
            fontSize: 'var(--fs-sm)',
            color: 'rgba(255,255,255,0.78)',
            paddingLeft: 'var(--sp-4)',
            position: 'relative',
            lineHeight: 1.5,
          }}>
            <span aria-hidden="true" style={{
              position: 'absolute', left: 0, top: 9,
              width: 6, height: 6, borderRadius: 999,
              background: '#A78BFA',
            }} />
            {b}
          </li>
        ))}
      </ul>

      <div style={{
        marginTop: 'var(--sp-12)',
        paddingTop: 'var(--sp-6)',
        borderTop: '1px solid rgba(244,242,247,0.12)',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 'var(--sp-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-4)' }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: 'clamp(56px, 7vw, 112px)',
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {s.stat}
          </span>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: 'rgba(244,242,247,0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            maxWidth: 200,
          }}>
            {s.statLabel}
          </span>
        </div>
        <div className="flex flex-wrap" style={{ gap: 'var(--sp-3)' }}>
          <a href="https://viox-os.vercel.app/" target="_blank" rel="noreferrer" className="btn btn-secondary">
            View VioX OS
          </a>
          <Link href="/pricing" className="btn btn-primary">
            Pricing
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}
