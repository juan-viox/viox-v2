import { Link } from 'wouter'
import Logo from './Logo'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ borderTop: '1px solid var(--border-default)', background: 'var(--surface-card)' }}>
      <div className="container-page section-tight">
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'minmax(0, 2fr) repeat(3, minmax(0, 1fr))',
            gap: 'var(--sp-12)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Logo size={22} />
            <p className="t-body" style={{ marginTop: 'var(--sp-4)', maxWidth: 320, fontSize: 'var(--fs-sm)' }}>
              Frontier AI agency. Agentic systems, AI-first cloud platforms, and cinematic websites — architected to ship.
            </p>
          </div>

          <FooterCol title="Product" items={[
            { label: 'Services', href: '/services' },
            { label: 'Work', href: '/work' },
            { label: 'Blog', href: '/blog' },
            { label: 'Pricing', href: '/pricing' },
          ]} />
          <FooterCol title="Company" items={[
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]} />
          <FooterCol title="Legal" items={[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ]} />
        </div>

        <div
          className="flex flex-wrap items-center justify-between"
          style={{
            marginTop: 'var(--sp-12)',
            paddingTop: 'var(--sp-6)',
            borderTop: '1px solid var(--border-subtle)',
            gap: 'var(--sp-4)',
          }}
        >
          <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
            © {year} VioX AI · Built in NYC
          </span>
          <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
            v2 · Trust &amp; Authority design system
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div style={{ minWidth: 0 }}>
      <h3 className="t-eyebrow" style={{ marginBottom: 'var(--sp-3)' }}>{title}</h3>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 'var(--fs-sm)' }}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
