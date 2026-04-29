#!/usr/bin/env node
/**
 * Weekly newsletter sender.
 *
 * Pulls the last 7 days of blog posts from feed.xml, formats them as a
 * branded HTML email, and broadcasts to the Resend audience.
 *
 * Required env:
 *   RESEND_API_KEY
 *   RESEND_AUDIENCE_ID
 *   NEWSLETTER_FROM      (e.g. "VioX AI <hello@viox.ai>")
 *
 * Designed to run via .github/workflows/newsletter-weekly.yml on Sundays 14:00 UTC.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE = 'https://www.viox.ai'

const apiKey = process.env.RESEND_API_KEY
const audienceId = process.env.RESEND_AUDIENCE_ID
const from = process.env.NEWSLETTER_FROM ?? 'VioX AI <hello@viox.ai>'

if (!apiKey || !audienceId) {
  console.error('✗ Missing RESEND_API_KEY or RESEND_AUDIENCE_ID')
  process.exit(1)
}

// ---------- Pull posts from local content/blog (most recent 7 days) ----------

const blogDir = path.join(ROOT, 'content/blog')
const files = (await fs.readdir(blogDir)).filter((f) => f.endsWith('.md'))

function fm(raw, key) {
  return raw.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]
}

const cutoff = new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10)
const posts = []
for (const f of files) {
  const raw = await fs.readFile(path.join(blogDir, f), 'utf8')
  const date = fm(raw, 'date')
  if (!date || date < cutoff) continue
  posts.push({
    slug: fm(raw, 'slug') ?? f.replace(/\.md$/, ''),
    title: fm(raw, 'title') ?? '',
    summary: fm(raw, 'summary') ?? '',
    category: fm(raw, 'category') ?? '',
    date,
  })
}
posts.sort((a, b) => b.date.localeCompare(a.date))

if (posts.length === 0) {
  console.log('→ No posts in the last 7 days. Skipping newsletter.')
  process.exit(0)
}

console.log(`→ Composing digest with ${posts.length} posts`)

// ---------- HTML email template ----------

const dateRange = `${posts[posts.length - 1].date} → ${posts[0].date}`
const subject = `VioX dispatch · ${posts.length} new — ${posts[0].title.slice(0, 60)}`

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:-apple-system,BlinkMacSystemFont,'Plus Jakarta Sans',Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e6e0;">
        <tr><td style="padding:48px 48px 16px;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#7C3AED;font-weight:600;">VioX AI · Weekly Dispatch</div>
          <h1 style="margin:12px 0 8px;font-size:30px;font-weight:800;letter-spacing:-0.025em;line-height:1.1;color:#0F0A1E;">This week in agentic AI.</h1>
          <p style="margin:0;font-size:15px;color:#666;">${dateRange}</p>
        </td></tr>
        <tr><td style="padding:0 48px 32px;">
          ${posts.map((p) => `
          <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e8e6e0;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#7C3AED;font-weight:600;">${escape(p.category)}</div>
            <a href="${SITE}/blog/${p.slug}" style="text-decoration:none;color:inherit;">
              <h2 style="margin:8px 0 8px;font-size:22px;font-weight:700;letter-spacing:-0.015em;line-height:1.25;color:#0F0A1E;">${escape(p.title)}</h2>
            </a>
            <p style="margin:8px 0 14px;font-size:15px;color:#444;line-height:1.55;">${escape(p.summary)}</p>
            <a href="${SITE}/blog/${p.slug}" style="font-size:14px;font-weight:600;color:#7C3AED;text-decoration:none;">Read article →</a>
          </div>`).join('')}
        </td></tr>
        <tr><td style="padding:32px 48px;background:#0F0A1E;color:#F4F2F7;text-align:center;">
          <div style="font-size:14px;line-height:1.6;opacity:0.85;">Want VioX agents running inside your business?</div>
          <a href="${SITE}/contact" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Book a strategy call</a>
        </td></tr>
        <tr><td style="padding:24px 48px;text-align:center;font-size:12px;color:#999;">
          You're receiving this because you subscribed at <a href="${SITE}/blog" style="color:#7C3AED;">viox.ai/blog</a><br>
          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#999;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

function escape(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// ---------- Broadcast via Resend ----------

console.log(`→ Sending broadcast (subject: "${subject}")`)

const res = await fetch('https://api.resend.com/broadcasts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    audience_id: audienceId,
    from,
    subject,
    html,
  }),
})

if (!res.ok) {
  const txt = await res.text().catch(() => '')
  console.error(`✗ Resend broadcast failed: ${res.status} — ${txt}`)
  process.exit(1)
}

const data = await res.json()
console.log(`  ✓ created broadcast ${data.id}`)

// Send the broadcast (Resend creates as draft; we send immediately)
const sendRes = await fetch(`https://api.resend.com/broadcasts/${data.id}/send`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
})

if (!sendRes.ok) {
  const txt = await sendRes.text().catch(() => '')
  console.error(`✗ Broadcast send failed: ${sendRes.status} — ${txt}`)
  process.exit(1)
}

console.log(`\n✓ Newsletter dispatched (${posts.length} posts)\n`)
