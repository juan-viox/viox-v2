// Vercel serverless function: POST /api/newsletter
// Accepts { email } and forwards to the viox-crm newsletter ingest endpoint,
// injecting the API key server-side. Falls back to logging if the CRM env
// vars aren't configured.
//
// CRM endpoint: POST {VIOX_CRM_URL}/api/v1/ingest/newsletter
// CRM payload:  { email, firstName? }

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

  const crmUrl = process.env.VIOX_CRM_URL
  const crmKey = process.env.VIOX_CRM_API_KEY

  if (crmUrl && crmKey) {
    try {
      const upstream = await fetch(`${crmUrl.replace(/\/$/, '')}/api/v1/ingest/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': crmKey,
        },
        body: JSON.stringify({ email }),
      })
      if (!upstream.ok) {
        const body = await upstream.text().catch(() => '')
        // eslint-disable-next-line no-console
        console.error('[viox] CRM newsletter upstream error', upstream.status, body)
        res.status(502).json({ ok: false, error: 'Signup temporarily unavailable' })
        return
      }
      res.status(200).json({ ok: true })
      return
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[viox] CRM newsletter network error', err)
      res.status(502).json({ ok: false, error: 'Signup temporarily unavailable' })
      return
    }
  }

  // Fallback: log only (local dev / pre-deploy)
  // eslint-disable-next-line no-console
  console.log('[viox] newsletter signup (not forwarded — CRM env not set)', {
    t: new Date().toISOString(),
    email,
  })
  res.status(200).json({ ok: true })
}
