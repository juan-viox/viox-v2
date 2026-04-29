/**
 * Reader analytics — Plausible integration.
 *
 * If PLAUSIBLE_API_KEY + PLAUSIBLE_SITE_ID are set, returns the top blog
 * posts by visitors over the last 30 days. Used by the generator as a
 * positive signal for what themes resonate.
 *
 * Silently returns [] if not configured — analytics is optional.
 */

const API_BASE = 'https://plausible.io/api/v1'

export async function topPostsLast30Days() {
  const apiKey = process.env.PLAUSIBLE_API_KEY
  const siteId = process.env.PLAUSIBLE_SITE_ID
  if (!apiKey || !siteId) return []

  const params = new URLSearchParams({
    site_id: siteId,
    period: '30d',
    property: 'event:page',
    limit: '20',
    filters: 'event:page==/blog/**',
  })
  const url = `${API_BASE}/stats/breakdown?${params}`

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } })
    if (!res.ok) {
      console.warn(`  ⚠ Plausible API ${res.status}`)
      return []
    }
    const data = await res.json()
    return (data.results ?? [])
      .map((r) => ({ path: r.page, visitors: r.visitors ?? 0 }))
      .filter((r) => r.visitors > 0)
      .slice(0, 10)
  } catch (err) {
    console.warn(`  ⚠ Plausible fetch failed: ${err.message}`)
    return []
  }
}
