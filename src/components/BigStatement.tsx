interface Props {
  num?: string
  eyebrow?: string
  children: React.ReactNode
}

export default function BigStatement({ num = '/ 03', eyebrow = 'Position', children }: Props) {
  return (
    <section className="section" aria-label={eyebrow}>
      <div className="container-page">
        <div
          className="flex items-baseline justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}
        >
          <span className="section-num">{num} — {eyebrow}</span>
        </div>
        <p
          style={{
            fontWeight: 800,
            fontSize: 'clamp(40px, 6.5vw, 112px)',
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            maxWidth: '18ch',
          }}
        >
          {children}
        </p>
      </div>
    </section>
  )
}
