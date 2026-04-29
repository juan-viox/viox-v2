// Vercel serverless function: POST /api/lead
// Accepts the contact form payload and forwards it to the viox-crm ingest
// endpoint, injecting the API key server-side so the secret never reaches
// the browser. If the CRM env vars aren't configured, falls back to logging
// the payload and returning `{ ok: true }` so the UI flow still works.
//
// Env vars (set in Vercel project settings):
//   VIOX_CRM_URL      — base URL, e.g. https://crm.viox.ai
//   VIOX_CRM_API_KEY  — the SITE_API_KEY secret from viox-crm
//
// Expected payload shape (keep in sync with ContactForm.tsx):
// { name, company, email, phone, projectType, budget, message }
//
// CRM endpoint: POST {VIOX_CRM_URL}/api/v1/ingest/lead
// CRM payload:  { firstName, lastName, emailAddress, phone, description }

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

type LeadPayload = {
  name?: string
  company?: string
  email?: string
  phone?: string
  projectType?: string
  budget?: string
  message?: string
}

function splitName(full: string | undefined): [string, string] {
  if (!full) return ['', '']
  const parts = full.trim().split(/\s+/)
  const first = parts.shift() ?? ''
  const last = parts.join(' ')
  return [first, last]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  let payload: LeadPayload
  try {
    payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as LeadPayload
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON' })
    return
  }

  if (!payload?.email || !payload?.name) {
    res.status(400).json({ ok: false, error: 'email and name are required' })
    return
  }

  const crmUrl = process.env.VIOX_CRM_URL
  const crmKey = process.env.VIOX_CRM_API_KEY

  // Build a compact description combining company, project type, budget, and message
  const description = [
    payload.company ? `Company: ${payload.company}` : null,
    payload.projectType ? `Project: ${payload.projectType}` : null,
    payload.budget ? `Budget: ${payload.budget}` : null,
    payload.message ? `\n${payload.message}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const [firstName, lastName] = splitName(payload.name)

  // Forward to CRM when configured; otherwise log and succeed
  if (crmUrl && crmKey) {
    try {
      const upstream = await fetch(`${crmUrl.replace(/\/$/, '')}/api/v1/ingest/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': crmKey,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          emailAddress: payload.email,
          phone: payload.phone ?? '',
          description,
        }),
      })
      if (!upstream.ok) {
        const body = await upstream.text().catch(() => '')
        // eslint-disable-next-line no-console
        console.error('[viox] CRM lead upstream error', upstream.status, body)
        res.status(502).json({ ok: false, error: 'CRM rejected lead' })
        return
      }
      const data = (await upstream.json().catch(() => ({}))) as { contactId?: string }
      res.status(200).json({ ok: true, contactId: data.contactId })
      return
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[viox] CRM lead network error', err)
      res.status(502).json({ ok: false, error: 'CRM unreachable' })
      return
    }
  }

  // Fallback: log only (local dev / pre-deploy)
  // eslint-disable-next-line no-console
  console.log('[viox] new lead (not forwarded — CRM env not set)', {
    t: new Date().toISOString(),
    name: payload.name,
    email: payload.email,
    projectType: payload.projectType,
  })
  res.status(200).json({ ok: true })
}
