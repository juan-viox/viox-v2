/**
 * Source ingestion: fetch RSS feeds, parse, score, dedupe.
 * Returns top N signals from the past N hours.
 */
import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'VioXBlogIngest/1.0 (+https://www.viox.ai)' },
})

/** Fetch one source, return its items (best-effort, never throws). */
async function fetchSource(src) {
  try {
    const feed = await parser.parseURL(src.url)
    return (feed.items ?? []).map((it) => ({
      title: it.title?.trim() ?? '',
      link: it.link ?? it.guid ?? '',
      summary: (it.contentSnippet ?? it.summary ?? it.content ?? '').trim().slice(0, 600),
      published: it.isoDate ?? it.pubDate ?? null,
      source: src.id,
      sourceWeight: src.weight,
      sourceTier: src.tier,
      sourceTopics: src.topics ?? [],
    }))
  } catch (err) {
    console.warn(`  ⚠ ${src.id} failed: ${err.message}`)
    return []
  }
}

/** Score a signal: source weight × time decay × tier bonus. */
function scoreSignal(s, nowMs) {
  if (!s.published) return s.sourceWeight * 0.5
  const ageHours = Math.max(0, (nowMs - new Date(s.published).getTime()) / 3_600_000)
  const decay = Math.exp(-ageHours / 36) // half-life ~25h
  const tierBonus = s.sourceTier === 1 ? 1.2 : s.sourceTier === 2 ? 1.0 : 0.8
  return s.sourceWeight * decay * tierBonus
}

/**
 * Pull all sources, dedupe by URL hash, score, sort newest+highest first.
 * @param {Array} sources  source list from sources.json
 * @param {number} maxHours  only include items from the past N hours (default 48)
 * @param {number} topN  cap output (default 30)
 */
export async function ingest(sources, { maxHours = 48, topN = 30 } = {}) {
  const nowMs = Date.now()
  const cutoffMs = nowMs - maxHours * 3_600_000

  console.log(`→ Fetching ${sources.length} sources...`)
  const all = (await Promise.all(sources.map(fetchSource))).flat()
  console.log(`  collected ${all.length} raw items`)

  const seen = new Set()
  const signals = []
  for (const s of all) {
    if (!s.title || !s.link) continue
    const pubMs = s.published ? new Date(s.published).getTime() : nowMs
    if (pubMs < cutoffMs) continue
    const key = (s.link || s.title).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    signals.push({ ...s, score: scoreSignal(s, nowMs) })
  }

  signals.sort((a, b) => b.score - a.score)
  console.log(`  ${signals.length} fresh, deduped — keeping top ${Math.min(topN, signals.length)}`)
  return signals.slice(0, topN)
}
