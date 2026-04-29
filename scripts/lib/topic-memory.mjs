/**
 * Topical coverage memory.
 *
 * Stores .blog-runs/topics-index.json — a rolling 30-day record of which
 * themes each published article touched. The generator queries this before
 * drafting to bias toward under-covered themes and avoid recent repeats.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { extractThemes, THEME_IDS } from './topics.mjs'

const WINDOW_DAYS = 30

export async function loadTopicIndex(root) {
  const filepath = path.join(root, '.blog-runs/topics-index.json')
  try {
    return JSON.parse(await fs.readFile(filepath, 'utf8'))
  } catch {
    return { posts: [] }
  }
}

export async function saveTopicIndex(root, index) {
  const filepath = path.join(root, '.blog-runs/topics-index.json')
  await fs.mkdir(path.dirname(filepath), { recursive: true })
  await fs.writeFile(filepath, JSON.stringify(index, null, 2))
}

/** Recompute the topic index from scratch by scanning all published articles. */
export async function rebuildTopicIndex(root) {
  const dir = path.join(root, 'content/blog')
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'))
  const posts = []
  for (const f of files) {
    const raw = await fs.readFile(path.join(dir, f), 'utf8')
    const slug = (raw.match(/^slug:\s*(\S+)/m)?.[1] ?? f.replace(/\.md$/, '')).replace(/['"]/g, '')
    const date = (raw.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1]) ?? '1970-01-01'
    const title = raw.match(/^title:\s*"([^"]+)"/m)?.[1] ?? ''
    const themes = extractThemes(title + '\n' + raw)
    posts.push({ slug, date, title, themes })
  }
  posts.sort((a, b) => b.date.localeCompare(a.date))
  return { posts }
}

/** Coverage map for the last N days: themeId → article count. */
export function coverageMap(index, days = WINDOW_DAYS) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const map = Object.fromEntries(THEME_IDS.map((id) => [id, 0]))
  for (const p of index.posts) {
    if (p.date < cutoff) continue
    for (const t of p.themes) {
      if (map[t] !== undefined) map[t] += 1
    }
  }
  return map
}

/** Append a new article to the index. */
export function appendPost(index, post) {
  index.posts.unshift(post)
  // Trim to last 90 days to keep file small
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  index.posts = index.posts.filter((p) => p.date >= cutoff)
  return index
}

/** Recent article titles for the prompt's "don't repeat these" list. */
export function recentTitles(index, days = 14) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  return index.posts.filter((p) => p.date >= cutoff).map((p) => p.title)
}
