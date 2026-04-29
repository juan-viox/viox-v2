import { Link } from 'wouter'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { allPosts, formatDate } from '@/lib/blog'
import HeroBackground from './HeroBackground'

export default function Hero() {
  const posts = allPosts()
  const latest = posts[0]
  const previewRow = posts.slice(0, 3)

  const tape = posts.length > 0
    ? posts.map((p) => ({ slug: p.slug, label: p.title.toUpperCase(), category: p.category }))
    : [{ slug: '', label: 'AGENTIC SYSTEMS · CLOUD-FIRST · BUILT TO SHIP', category: '' }]
  const tapeDoubled = [...tape, ...tape]

  return (
    <section
      className="on-dark surface-inverted"
      style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}
      aria-label="Hero"
    >
      <HeroBackground />

      {/* Subtle fade-to-darker scrim at the bottom — keeps the dispatches/marquee legible */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, transparent 0%, transparent 35%, rgba(8,5,18,0.55) 75%, rgba(8,5,18,0.95) 100%)',
        }}
      />

      {/* Right vertical rule */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, right: 'clamp(1.5rem, 5vw, 4rem)',
          bottom: 0, width: 1,
          background: 'rgba(244,242,247,0.10)',
          zIndex: 2,
        }}
      />

      <div
        className="container-page"
        style={{
          position: 'relative', zIndex: 3,
          minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          paddingTop: 'calc(64px + var(--sp-8))',
          paddingBottom: 'var(--sp-6)',
        }}
      >
        {/* Top row: live status + latest dispatch chip */}
        <div
          className="flex items-center justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)' }}
        >
          <div className="flex items-center" style={{ gap: 'var(--sp-3)' }}>
            <StatusDot />
            <span className="t-mono" style={{
              fontSize: 'var(--fs-xs)',
              color: 'rgba(244,242,247,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}>
              VioX Live · NYC · Est. 2018
            </span>
          </div>

          {latest && (
            <Link
              href={`/blog/${latest.slug}`}
              className="latest-dispatch-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                padding: '8px 14px',
                background: 'rgba(34,211,238,0.10)',
                border: '1px solid rgba(34,211,238,0.30)',
                borderRadius: 999,
                color: 'rgba(244,242,247,0.95)',
                textDecoration: 'none',
                fontSize: 'var(--fs-xs)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                maxWidth: 480,
                transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                color: '#67E8F9',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                flexShrink: 0,
              }}>
                ✦ Latest
              </span>
              <span style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 500,
              }}>
                {latest.title}
              </span>
              <ArrowUpRight size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
            </Link>
          )}
        </div>

        {/* Editorial centerpiece — single declarative claim, not a list */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBlock: 'clamp(var(--sp-8), 4vw, var(--sp-16))',
        }}>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: '#A78BFA',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: 'var(--sp-6)',
          }}>
            Frontier AI Agency · Operators only
          </span>

          <h1
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 'clamp(48px, 8vw, 124px)',
              lineHeight: 0.96,
              letterSpacing: '-0.045em',
              maxWidth: '16ch',
            }}
          >
            The AI agency<br />
            for operators<br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              who <span style={{
                background: 'linear-gradient(120deg, #A78BFA 0%, #67E8F9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>ship</span>
              <span aria-hidden="true" style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '0.05em',
                height: '4px',
                background: 'linear-gradient(120deg, #A78BFA 0%, #67E8F9 100%)',
                borderRadius: '2px',
                opacity: 0.8,
              }} />.
            </span>
          </h1>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 'var(--sp-12)',
              marginTop: 'var(--sp-10)',
              alignItems: 'end',
            }}
          >
            <p style={{
              maxWidth: 540,
              color: 'rgba(255,255,255,0.84)',
              fontSize: 'var(--fs-lg)',
              fontWeight: 500,
              lineHeight: 1.45,
              letterSpacing: '-0.005em',
            }}>
              Voice on phone lines. Decisions in CRMs. Code in production.
              We architect agentic systems and AI-first cloud platforms — and we ship them by Friday.
            </p>

            <div className="flex flex-wrap" style={{ gap: 'var(--sp-3)', justifySelf: 'end' }}>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Book a strategy call
                <ArrowRight size={16} />
              </Link>
              <Link href="/work" className="btn btn-secondary btn-lg">
                See the work
              </Link>
            </div>
          </div>
        </div>

        {/* Latest dispatches preview row */}
        {previewRow.length > 0 && (
          <div
            style={{
              marginTop: 'var(--sp-6)',
              borderTop: '1px solid rgba(244,242,247,0.10)',
              paddingTop: 'var(--sp-6)',
            }}
          >
            <div
              className="flex items-baseline justify-between"
              style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}
            >
              <span className="t-mono" style={{
                fontSize: 'var(--fs-xs)',
                color: '#67E8F9',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
              }}>
                <StatusDot />
                Live dispatches
              </span>
              <Link
                href="/blog"
                style={{
                  fontSize: 'var(--fs-xs)',
                  color: 'rgba(244,242,247,0.65)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                }}
              >
                All articles <ArrowRight size={12} />
              </Link>
            </div>

            <div
              className="dispatch-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 'var(--sp-3)',
              }}
            >
              {previewRow.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="dispatch-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sp-2)',
                    padding: 'var(--sp-4)',
                    background: 'rgba(244,242,247,0.04)',
                    border: '1px solid rgba(244,242,247,0.08)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: '#FFFFFF',
                    transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
                    minHeight: 110,
                  }}
                >
                  <div className="flex items-center justify-between" style={{ gap: 'var(--sp-2)' }}>
                    <span className="t-mono" style={{
                      fontSize: 11,
                      color: '#A78BFA',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 600,
                    }}>
                      {p.category}
                    </span>
                    <span className="t-mono" style={{
                      fontSize: 11,
                      color: 'rgba(244,242,247,0.45)',
                    }}>
                      {formatDate(p.date)} · {p.readingMinutes} min
                    </span>
                  </div>
                  <div style={{
                    fontSize: 'var(--fs-sm)',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    color: '#FFFFFF',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {p.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom: scrolling tape of all blog titles */}
        <div
          style={{
            marginTop: 'var(--sp-6)',
            borderTop: '1px solid rgba(244,242,247,0.10)',
            paddingTop: 'var(--sp-3)',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <div
            className="animate-marquee-fast flex"
            style={{
              gap: 'var(--sp-12)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 'clamp(16px, 2vw, 22px)',
              letterSpacing: '-0.02em',
              color: 'rgba(244,242,247,0.32)',
            }}
          >
            {tapeDoubled.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                {t.category && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#67E8F9',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                  }}>
                    {t.category}
                  </span>
                )}
                {t.label}
                <span style={{ color: '#A78BFA', opacity: 0.55 }}>×</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dispatch-grid { grid-template-columns: 1fr !important; }
          .latest-dispatch-pill { max-width: 100% !important; }
        }
        .latest-dispatch-pill:hover {
          background: rgba(34,211,238,0.18) !important;
          border-color: rgba(34,211,238,0.55) !important;
        }
        .dispatch-card:hover {
          background: rgba(244,242,247,0.08) !important;
          border-color: rgba(167,139,250,0.40) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  )
}

function StatusDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 8, height: 8,
      }}
    >
      <span style={{
        position: 'absolute', inset: 0,
        background: '#22D3EE',
        borderRadius: 999,
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        background: '#22D3EE',
        borderRadius: 999,
        animation: 'pulse-dot 1.6s var(--ease-out) infinite',
      }} />
      <style>{`
        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 0.7; } }
        }
      `}</style>
    </span>
  )
}
