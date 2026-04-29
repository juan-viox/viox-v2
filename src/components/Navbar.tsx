import { useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

const links = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [location] = useLocation()
  const onHero = location === '/' && !scrolled
  const inverted = onHero

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const linkColor = inverted ? 'rgba(244,242,247,0.72)' : 'var(--text-secondary)'
  const linkActive = inverted ? '#FFFFFF' : 'var(--text-primary)'

  return (
    <>
      <nav
        className={inverted ? 'on-dark' : ''}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled ? 'oklch(0.98 0.003 60 / 0.92)' : (inverted ? 'transparent' : 'oklch(0.98 0.003 60 / 0.92)'),
          backdropFilter: scrolled || !inverted ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled || !inverted ? 'blur(16px)' : 'none',
          borderBottom: scrolled || !inverted ? '1px solid var(--border-default)' : '1px solid transparent',
          transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        }}
      >
        <div className="container-page flex items-center justify-between" style={{ height: 64 }}>
          <Link href="/" aria-label="VioX AI home" style={{ textDecoration: 'none' }}>
            <Logo size={20} inverted={inverted} />
          </Link>

          <div className="hidden md:flex items-center" style={{ gap: 'var(--sp-8)' }}>
            {links.map((l) => {
              const active = location === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 'var(--fs-sm)',
                    fontWeight: active ? 600 : 500,
                    color: active ? linkActive : linkColor,
                    textDecoration: 'none',
                    transition: 'color var(--dur-fast) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = linkActive }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = active ? linkActive : linkColor }}
                >
                  {l.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex">
            <Link href="/contact" className="btn btn-primary btn-sm">
              Book a call
            </Link>
          </div>

          <button
            className="md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: inverted ? '#F4F2F7' : 'var(--text-primary)',
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'oklch(0.10 0.015 290 / 0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 'var(--sp-8)',
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 28, fontWeight: 600, color: '#F4F2F7',
                textDecoration: 'none', letterSpacing: '-0.02em',
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--sp-4)' }}>
            Book a call
          </Link>
        </div>
      )}
    </>
  )
}
