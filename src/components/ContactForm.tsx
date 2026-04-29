import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>

    const newErrors: Record<string, string> = {}
    if (!data.name?.trim()) newErrors.name = 'Please tell us your name.'
    if (!data.email?.includes('@')) newErrors.email = 'Please use a valid email.'
    if (!data.message?.trim() || data.message.length < 10) newErrors.message = 'A few sentences about what you need would help.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return

    setStatus('submitting')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Bad response')
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="card"
        style={{ borderColor: 'var(--color-brand)' }}
      >
        <h2 className="t-h3">Message received.</h2>
        <p className="t-body" style={{ marginTop: 'var(--sp-3)' }}>
          We'll be back within one business day with a short proposal and a calendar link.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <Field name="name" label="Your name" required error={errors.name} />
      <Field name="company" label="Company" required={false} />
      <Field name="email" type="email" label="Work email" required error={errors.email} autoComplete="email" />
      <Field name="phone" type="tel" label="Phone" required={false} autoComplete="tel" />

      <div>
        <label className="field-label" htmlFor="projectType">Project type</label>
        <select id="projectType" name="projectType" className="field-select" defaultValue="">
          <option value="" disabled>Pick one…</option>
          <option value="ai-agent">AI agent (voice or chat)</option>
          <option value="automation">Workflow automation</option>
          <option value="cinematic-site">Cinematic / 3D website</option>
          <option value="other">Something else</option>
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="budget">Budget range</label>
        <select id="budget" name="budget" className="field-select" defaultValue="">
          <option value="" disabled>Pick one…</option>
          <option value="<10k">Under $10K</option>
          <option value="10-25k">$10K – $25K</option>
          <option value="25-75k">$25K – $75K</option>
          <option value="75k+">$75K+</option>
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="message">What do you need shipped?</label>
        <textarea
          id="message"
          name="message"
          className="field-textarea"
          required
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-err' : undefined}
        />
        {errors.message && <p id="message-err" className="field-error" role="alert">{errors.message}</p>}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={status === 'submitting'}
        style={{ alignSelf: 'flex-start' }}
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>

      {status === 'error' && (
        <p className="field-error" role="alert">
          Something went wrong. Email us directly at{' '}
          <a href="mailto:hello@viox.ai" style={{ color: 'var(--color-brand)' }}>hello@viox.ai</a>.
        </p>
      )}
    </form>
  )
}

interface FieldProps {
  name: string
  label: string
  type?: string
  required?: boolean
  error?: string
  autoComplete?: string
}

function Field({ name, label, type = 'text', required = false, error, autoComplete }: FieldProps) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
        {required && <span aria-hidden="true" style={{ color: 'var(--color-brand)', marginLeft: 4 }}>*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="field-input"
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
        autoComplete={autoComplete}
      />
      {error && <p id={`${name}-err`} className="field-error" role="alert">{error}</p>}
    </div>
  )
}
