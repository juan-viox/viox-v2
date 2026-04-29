// POST /api/subscribe — Resend Audiences signup (newsletter opt-in).
// Accepts { email } and adds to the configured Resend audience.
// Falls back to logging if env vars not set (dev mode).

type VercelRequest = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}
type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
  end: (body?: string) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  let email: string | undefined
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    email = (payload as { email?: string })?.email?.trim()
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON' })
    return
  }

  if (!email || !email.includes('@')) {
    res.status(400).json({ ok: false, error: 'Invalid email' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (apiKey && audienceId) {
    try {
      const upstream = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      })
      if (!upstream.ok && upstream.status !== 409) {
        // 409 = already subscribed; treat as success to avoid leaking subscription status
        const txt = await upstream.text().catch(() => '')
        // eslint-disable-next-line no-console
        console.error('[viox] Resend subscribe failed', upstream.status, txt)
        res.status(502).json({ ok: false, error: 'Signup temporarily unavailable' })
        return
      }
      res.status(200).json({ ok: true })
      return
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[viox] Resend network error', err)
      res.status(502).json({ ok: false, error: 'Signup temporarily unavailable' })
      return
    }
  }

  // Dev fallback
  // eslint-disable-next-line no-console
  console.log('[viox] newsletter signup (Resend env not set)', { email, t: new Date().toISOString() })
  res.status(200).json({ ok: true })
}
