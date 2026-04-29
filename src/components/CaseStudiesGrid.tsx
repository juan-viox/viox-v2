import { Link } from 'wouter'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { CASE_STUDIES, type CaseStudy } from '@/config/case-studies'

interface Props {
  limit?: number
  featuredOnly?: boolean
  heading?: string
  bento?: boolean
}

export default function CaseStudiesGrid({
  limit,
  featuredOnly = false,
  heading = 'Selected work.',
  bento = true,
}: Props) {
  let items: CaseStudy[] = featuredOnly
    ? CASE_STUDIES.filter((c) => c.featured)
    : CASE_STUDIES
  if (limit) items = items.slice(0, limit)

  return (
    <section className="section surface-elevated" aria-labelledby="cases-h">
      <div className="container-page">
        <div
          className="flex items-baseline justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}
        >
          <span className="section-num">/ 05 — Selected work</span>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            {items.length.toString().padStart(2, '0')} · 2018 — present
          </span>
        </div>

        <h2 id="cases-h" className="t-h1 x-rule">{heading}</h2>

        {/* Bento layout: 1 large featured + asymmetric rest */}
        <div
          className="grid case-bento"
          style={{
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gap: 'var(--sp-6)',
            marginTop: 'var(--sp-16)',
          }}
        >
          {items.map((c, i) => {
            // Bento sizing: 0=large(8), 1=medium(4), 2=medium(4), 3=large(8), 4=small(4), 5=small(4)…
            const span = bento ? bentoSpan(i) : 'span 6'
            const isLarge = bento && (i === 0 || i === 3)
            const isInverted = bento && i === 0
            return (
              <article
                key={c.slug}
                className={isInverted ? 'on-dark' : 'card'}
                style={{
                  gridColumn: span,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: isLarge ? 440 : 320,
                  borderRadius: 'var(--radius-lg)',
                  padding: isInverted
                    ? 'clamp(var(--sp-8), 3.5vw, var(--sp-16))'
                    : undefined,
                  background: isInverted ? 'var(--surface-inverted)' : undefined,
                  color: isInverted ? 'var(--text-on-inverted)' : undefined,
                  border: isInverted ? 'none' : undefined,
                }}
              >
                <CardHead c={c} inverted={isInverted} />

                <h3
                  style={{
                    marginTop: 'var(--sp-4)',
                    fontWeight: 700,
                    fontSize: isLarge
                      ? 'clamp(28px, 3.5vw, 48px)'
                      : 'var(--fs-lg)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.025em',
                    color: isInverted ? '#FFFFFF' : 'var(--text-primary)',
                  }}
                >
                  {c.headline}
                </h3>

                {(isLarge || !bento) && (
                  <p style={{
                    marginTop: 'var(--sp-3)',
                    fontSize: 'var(--fs-sm)',
                    color: isInverted ? 'rgba(255,255,255,0.72)' : 'var(--text-secondary)',
                    maxWidth: 560,
                  }}>
                    {c.description}
                  </p>
                )}

                {/* Oversized metric as visual centerpiece */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--sp-12)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 'var(--sp-4)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 800,
                        fontSize: isLarge
                          ? 'clamp(72px, 9vw, 144px)'
                          : 'clamp(48px, 5vw, 72px)',
                        lineHeight: 0.92,
                        letterSpacing: '-0.05em',
                        color: isInverted ? '#FFFFFF' : 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {c.metric}
                    </div>
                    <div className="t-mono" style={{
                      marginTop: 'var(--sp-2)',
                      fontSize: 'var(--fs-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: isInverted ? 'rgba(255,255,255,0.55)' : 'var(--text-tertiary)',
                    }}>
                      {c.metricLabel}
                    </div>
                  </div>
                  <div className="flex flex-wrap" style={{ gap: 'var(--sp-2)', flexShrink: 0 }}>
                    {c.liveUrl && (
                      <a
                        href={c.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={isInverted ? 'btn btn-secondary btn-sm' : 'btn btn-ghost btn-sm'}
                        aria-label={`Visit ${c.name} live site`}
                      >
                        Visit
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                    <Link
                      href={`/work/${c.slug}`}
                      className={isInverted ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      aria-label={`Read case study for ${c.name}`}
                    >
                      Case study
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .case-bento > * {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </section>
  )
}

function CardHead({ c, inverted }: { c: CaseStudy; inverted: boolean }) {
  const muted = inverted ? 'rgba(255,255,255,0.55)' : 'var(--text-tertiary)'
  return (
    <div className="flex items-start justify-between" style={{ gap: 'var(--sp-4)' }}>
      <span className="t-mono" style={{
        fontSize: 'var(--fs-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: muted,
      }}>
        {c.industry}
      </span>
      <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: muted }}>
        {c.year}
      </span>
    </div>
  )
}

function bentoSpan(i: number): string {
  // 12-col bento: large=span 8, medium=span 4
  const map: Record<number, string> = {
    0: 'span 8',  // Featured large (inverted)
    1: 'span 4',
    2: 'span 4',
    3: 'span 8',  // Second large
    4: 'span 4',
    5: 'span 4',
    6: 'span 4',
    7: 'span 4',
  }
  return map[i] ?? 'span 4'
}
