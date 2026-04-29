const STATS = [
  { value: '2018', label: 'Building applied AI', sub: 'Eight years shipping' },
  { value: '08', label: 'Cinematic projects shipped', sub: 'Boutique to enterprise' },
  { value: '24/7', label: 'Voice agent uptime', sub: 'On live phone lines' },
]

export default function ProofBar() {
  return (
    <section
      aria-label="Numbers"
      className="surface-inverted on-dark"
      style={{ borderBottom: '1px solid var(--border-on-inverted)' }}
    >
      <div className="container-page" style={{ paddingBlock: 'clamp(var(--sp-16), 8vw, var(--sp-32))' }}>
        <div className="flex items-baseline justify-between" style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}>
          <span className="section-num section-num-on-dark">/ 01 — Numbers</span>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: 'rgba(244,242,247,0.50)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            What's running today
          </span>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 0,
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                paddingInline: i === 0 ? 0 : 'var(--sp-8)',
                paddingRight: i === STATS.length - 1 ? 0 : undefined,
                borderLeft: i === 0 ? 'none' : '1px solid rgba(244,242,247,0.10)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 800,
                  fontSize: 'clamp(72px, 10vw, 160px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.05em',
                  color: '#FFFFFF',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {s.value}
              </div>
              <div style={{
                marginTop: 'var(--sp-4)',
                fontSize: 'var(--fs-md)',
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}>
                {s.label}
              </div>
              <div className="t-mono" style={{
                marginTop: 'var(--sp-2)',
                fontSize: 'var(--fs-xs)',
                color: 'rgba(244,242,247,0.50)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
