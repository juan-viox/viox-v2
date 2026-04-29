import { useState } from 'react'
import { Link } from 'wouter'
import { Check } from 'lucide-react'
import { PRICING, type PricingTab } from '@/config/pricing'

const TABS: { id: PricingTab; label: string }[] = [
  { id: 'os', label: 'VioX OS' },
  { id: 'ai', label: 'AI Services' },
  { id: 'cinematic', label: 'Cinematic / 3D' },
  { id: 'ongoing', label: 'Ongoing' },
]

export default function PricingTabs() {
  const [tab, setTab] = useState<PricingTab>('os')
  const tiers = PRICING.filter((p) => p.tab === tab)

  return (
    <section className="section" aria-labelledby="pricing-h">
      <div className="container-page">
        <div style={{ maxWidth: 720 }}>
          <span className="t-eyebrow">Pricing</span>
          <h2 id="pricing-h" className="t-h1" style={{ marginTop: 'var(--sp-3)' }}>
            Transparent pricing. Real outcomes.
          </h2>
          <p className="t-body" style={{ marginTop: 'var(--sp-4)' }}>
            Three engagement modes — pick the one that matches what you need shipped.
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Pricing categories"
          style={{
            marginTop: 'var(--sp-8)',
            display: 'inline-flex',
            padding: 4,
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            gap: 4,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  height: 40,
                  paddingInline: 'var(--sp-4)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: active ? 'var(--surface-card)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 2px oklch(0 0 0 / 0.06)' : 'none',
                  transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${Math.min(tiers.length, 3)}, minmax(0, 1fr))`,
            gap: 'var(--sp-6)',
            marginTop: 'var(--sp-12)',
          }}
        >
          {tiers.map((t) => (
            <article
              key={t.name}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderColor: t.highlighted ? 'var(--color-brand)' : undefined,
                borderWidth: t.highlighted ? 2 : 1,
                position: 'relative',
              }}
            >
              {t.highlighted && (
                <span
                  className="t-mono"
                  style={{
                    position: 'absolute', top: -10, left: 24,
                    background: 'var(--color-brand)', color: '#fff',
                    fontSize: 11, padding: '4px 10px', borderRadius: 999,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  Most picked
                </span>
              )}

              <h3 className="t-h3">{t.name}</h3>
              <div style={{ marginTop: 'var(--sp-3)', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontSize: 'var(--fs-3xl)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {t.price}
                </span>
                {t.unit && (
                  <span className="t-mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                    {t.unit}
                  </span>
                )}
              </div>
              {t.setup && (
                <div className="t-mono" style={{
                  marginTop: 'var(--sp-2)',
                  fontSize: 'var(--fs-xs)',
                  color: 'var(--color-brand)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}>
                  + {t.setup}
                </div>
              )}
              <p className="t-body" style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--fs-sm)' }}>
                {t.blurb}
              </p>

              <ul style={{
                marginTop: 'var(--sp-6)',
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                flex: 1,
              }}>
                {t.features.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    <Check size={16} strokeWidth={2.25} style={{ color: 'var(--color-brand)', flexShrink: 0, marginTop: 3 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={t.ctaHref}
                className={`btn ${t.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                style={{ marginTop: 'var(--sp-8)', width: '100%' }}
              >
                {t.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
