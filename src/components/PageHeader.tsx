interface Props {
  eyebrow: string
  title: string
  subtitle?: string
}

export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <header className="section-tight" style={{ paddingTop: 'calc(64px + var(--sp-16))' }}>
      <div className="container-page">
        <div style={{ maxWidth: 760 }}>
          <span className="t-eyebrow">{eyebrow}</span>
          <h1 className="t-h1" style={{ marginTop: 'var(--sp-3)' }}>{title}</h1>
          {subtitle && (
            <p className="t-body" style={{ marginTop: 'var(--sp-4)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
