import { Link } from 'wouter'
import { ArrowRight, Check } from 'lucide-react'

const TRUST = [
  'Free 30-min strategy call',
  'No pilot fees, ever',
  'Ship in 2–8 weeks',
]

export default function CTABanner() {
  return (
    <section className="section surface-inverted on-dark" aria-labelledby="cta-h">
      <div className="container-page">
        <div
          className="flex items-baseline justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}
        >
          <span className="section-num section-num-on-dark">/ 06 — Start here</span>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: 'rgba(244,242,247,0.50)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            One business day response
          </span>
        </div>

        <h2
          id="cta-h"
          style={{
            fontWeight: 800,
            fontSize: 'clamp(48px, 7.5vw, 144px)',
            lineHeight: 0.94,
            letterSpacing: '-0.045em',
            color: '#FFFFFF',
            maxWidth: '12ch',
          }}
        >
          Let's scope what to ship<span style={{ color: '#A78BFA' }}> first.</span>
        </h2>

        <div
          className="grid"
          style={{
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 'var(--sp-12)',
            alignItems: 'end',
            marginTop: 'var(--sp-12)',
          }}
        >
          <div>
            <p style={{
              fontSize: 'var(--fs-md)',
              color: 'rgba(255,255,255,0.78)',
              maxWidth: 540,
            }}>
              Tell us where AI could remove the most friction in your business. We'll
              come back with a 1-page plan, a fixed price, and a delivery date.
            </p>

            <div className="flex flex-wrap" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Book a strategy call
                <ArrowRight size={16} />
              </Link>
              <Link href="/work" className="btn btn-secondary btn-lg">
                See work first
              </Link>
            </div>
          </div>

          <ul style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}>
            {TRUST.map((t) => (
              <li key={t} style={{
                display: 'flex',
                gap: 'var(--sp-3)',
                alignItems: 'center',
                fontSize: 'var(--fs-md)',
                color: 'rgba(255,255,255,0.85)',
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: 'rgba(124,58,237,0.20)',
                  color: '#A78BFA',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Check size={15} strokeWidth={2.5} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
