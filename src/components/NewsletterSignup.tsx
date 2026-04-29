import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

interface Props {
  variant?: 'inline' | 'card'
  heading?: string
  subhead?: string
}

export default function NewsletterSignup({
  variant = 'card',
  heading = 'Frontier AI dispatches, weekly.',
  subhead = 'One Sunday email. Top frontier signals + the week\'s articles. Zero spam.',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Enter a valid email.')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setError('Something went wrong. Try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={variant === 'card' ? 'card' : ''}
        style={{
          borderColor: 'var(--color-brand)',
          background: variant === 'card' ? 'var(--surface-card)' : 'transparent',
          padding: variant === 'card' ? 'var(--sp-8)' : 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
        }}
      >
        <span style={{
          width: 32, height: 32, borderRadius: 999,
          background: 'var(--color-brand-soft)',
          color: 'var(--color-brand)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Check size={16} strokeWidth={2.5} />
        </span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>You're in.</div>
          <div className="t-caption" style={{ marginTop: 2 }}>First dispatch lands Sunday at 9 AM ET.</div>
        </div>
      </div>
    )
  }

  const wrapStyle: React.CSSProperties =
    variant === 'card'
      ? { padding: 'clamp(var(--sp-6), 3vw, var(--sp-12))' }
      : {}

  return (
    <div className={variant === 'card' ? 'card' : ''} style={wrapStyle}>
      {variant === 'card' && (
        <>
          <span className="t-eyebrow">Newsletter</span>
          <h3 className="t-h3" style={{ marginTop: 'var(--sp-2)' }}>{heading}</h3>
          <p className="t-body" style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-sm)' }}>
            {subhead}
          </p>
        </>
      )}
      <form
        onSubmit={onSubmit}
        noValidate
        style={{
          marginTop: variant === 'card' ? 'var(--sp-6)' : 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)',
        }}
      >
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          aria-invalid={!!error}
          className="field-input"
          style={{ flex: '1 1 220px', minHeight: 48 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'submitting'}
          style={{ flex: '0 0 auto' }}
        >
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          {status !== 'submitting' && <ArrowRight size={16} />}
        </button>
      </form>
      {error && (
        <p className="field-error" role="alert" style={{ marginTop: 'var(--sp-2)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
