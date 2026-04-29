#!/usr/bin/env node
/**
 * VioX daily blog generator.
 *
 * Pipeline:
 *   1. Determine today's category from day-of-week (sources.json categoryRotation)
 *   2. Ingest 30 signals from RSS sources (past 48h, scored, deduped)
 *   3. Send to Claude Sonnet 4.6 with brand voice + voice rules + signals + JSON schema
 *   4. Parse Claude response → write blog markdown + social companion JSON
 *   5. Eval gates run separately (eval-blog.mjs)
 *
 * Env required:
 *   ANTHROPIC_API_KEY
 *
 * Outputs:
 *   content/blog/<slug>.md
 *   content/social/<slug>.json
 *   .blog-runs/<date>-<slug>.json    ← run metadata for audit
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import Anthropic from '@anthropic-ai/sdk'
import { ingest } from './lib/sources.mjs'
import { extractThemes, themesPromptBlock } from './lib/topics.mjs'
import { loadTopicIndex, rebuildTopicIndex, coverageMap, appendPost, recentTitles } from './lib/topic-memory.mjs'
import { topPostsLast30Days } from './lib/analytics.mjs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ---------- Config ----------

const MODEL = 'claude-sonnet-4-5'   // primary draft model
const sources = JSON.parse(await fs.readFile(path.join(__dirname, 'sources.json'), 'utf8'))
const voiceSpec = await fs.readFile(path.join(__dirname, 'brand-voice.md'), 'utf8')

// Today's category (UTC; cron runs 06:00 UTC so this is the publishing day)
const day = new Date().getUTCDay()
const category = sources.categoryRotation[String(day)]
if (!category) {
  console.log('→ No publishing today (Saturday). Exiting.')
  process.exit(0)
}
const dateISO = new Date().toISOString().slice(0, 10)
console.log(`→ Generating ${category} article for ${dateISO}`)

// ---------- Step 1: Ingest signals ----------

const signals = await ingest(sources.sources, { maxHours: 48, topN: 30 })
if (signals.length < 5) {
  console.error(`✗ Only ${signals.length} signals — aborting (likely all sources unreachable).`)
  process.exit(1)
}

// Filter signals to the today's-category topic when possible
const onTopic = signals.filter((s) =>
  s.sourceTopics.includes(categoryToTopicKey(category))
)
const candidatePool = onTopic.length >= 8 ? onTopic : signals
console.log(`→ ${candidatePool.length} candidates (${onTopic.length} on-topic for ${category})`)

// ---------- Step 2: Build Claude prompt ----------

const exemplarTitles = await loadExemplarTitles()
const today = new Date().toISOString().slice(0, 10)
const recentSlugs = await loadRecentSlugs()

// Topic memory: auto-rebuild if missing (first run), otherwise load
let topicIndex = await loadTopicIndex(ROOT)
if (topicIndex.posts.length === 0) {
  console.log('→ Building topic index from existing posts (first run)')
  topicIndex = await rebuildTopicIndex(ROOT)
}
const coverage = coverageMap(topicIndex, 30)
const recentTitleList = recentTitles(topicIndex, 14)
const undercovered = Object.entries(coverage)
  .filter(([_, n]) => n === 0)
  .map(([id]) => id)
const saturated = Object.entries(coverage)
  .filter(([_, n]) => n >= 4)
  .map(([id]) => id)
console.log(`→ Topic memory: ${topicIndex.posts.length} indexed, ${undercovered.length} uncovered themes, ${saturated.length} saturated`)

// Reader analytics: top-performing posts feed positive signal back into the prompt
const topPerforming = await topPostsLast30Days().catch(() => [])
if (topPerforming.length) console.log(`→ Analytics: top ${topPerforming.length} posts pulled from Plausible`)

const SYSTEM_PROMPT = `You are the staff writer for VioX AI's blog. Every article you produce ships under the VioX brand. Your job: produce one article per day, in the VioX voice exactly, picking the highest-leverage story from the day's signals.

You have ABSOLUTE adherence to the voice spec below. You also produce companion LinkedIn + Twitter copy for social distribution.

${voiceSpec}

---

# Output schema (JSON, return ONLY JSON, no markdown fences)

{
  "slug": "kebab-case-from-title-no-date",
  "title": "Specific opinionated title following the formula",
  "category": "${category}",
  "tags": ["3-5 relevant tags, all lowercase, no spaces (use hyphens)"],
  "summary": "1-2 sentence article summary, 140-200 chars, used in OG meta",
  "sources_used": [
    { "title": "...", "url": "..." }
  ],
  "article_markdown": "Full article body in markdown. NO frontmatter. Starts with the hook paragraph. Uses ## for section headers. ~900 words for Frontier/Field notes, ~1200 for Stack.",
  "linkedin": {
    "hook": "First 1-2 lines visible above the LinkedIn fold. Under 200 chars. Stop the scroll.",
    "body": "5-7 short paragraphs separated by \\n\\n. NO link in body. End with one-line teaser.",
    "cta": "Single line, e.g. 'Full breakdown on the blog ↓'",
    "hashtags": ["#AgenticAI", "..."]
  },
  "twitter": {
    "thread": ["Tweet 1 (the hook)", "Tweet 2", "..."]
  }
}`

const USER_PROMPT = `Today is ${today}. Today's category: **${category}**.

# Signals from the last 48 hours

Below are 30 ranked signals from frontier AI sources. Read all of them, then PICK ONE story (or one tightly-related cluster of 2-3) and write the day's article around it.

${candidatePool.map((s, i) => `${i + 1}. [${s.source}] ${s.title}
   ${s.summary || '(no summary)'}
   ${s.link}
`).join('\n')}

# Rules for picking

- For ${category} category, prefer signals that match. ${categoryGuidance(category)}
- Prefer stories where VioX has a real, specific take (not generic commentary)
- If nothing in today's signals is interesting enough, pick the strongest available and write a sharper take than the source has

# Topic coverage memory (last 30 days)

Theme counts in our recent rotation:
${themesPromptBlock(coverage)}

★ uncovered themes deserve priority — pick a signal that touches one of these if at all reasonable.
⚠ saturated themes (≥4 recent posts) should be SKIPPED unless you have a genuinely sharper angle.

# Recent article titles (DO NOT repeat these themes verbatim)

${recentTitleList.slice(0, 12).map((t) => `  · ${t}`).join('\n') || '  (none yet)'}

${topPerforming.length ? `# Top-performing past articles (positive signal — themes that resonate with our audience)

${topPerforming.slice(0, 5).map((p) => `  · ${p.path} — ${p.visitors} visitors`).join('\n')}

Lean toward themes similar to these when the day's signals support it.
` : ''}

# Reference titles from VioX exemplars (match this style)

${exemplarTitles.map((t) => `  · ${t}`).join('\n')}

# Output

Return ONE JSON object matching the schema. NO markdown fences. NO commentary outside the JSON.`

// ---------- Step 3: Call Claude ----------

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

console.log(`→ Generating with ${MODEL}...`)
const t0 = Date.now()

const response = await client.messages.create({
  model: MODEL,
  max_tokens: 8000,
  // Prompt cache the stable parts (voice spec, schema) — saves ~70% on input cost
  system: [
    { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
  ],
  messages: [
    { role: 'user', content: USER_PROMPT },
  ],
})

const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`  done in ${elapsedSec}s · in:${response.usage.input_tokens} cached:${response.usage.cache_read_input_tokens ?? 0} out:${response.usage.output_tokens}`)

// ---------- Step 4: Parse + write ----------

const rawText = response.content.find((c) => c.type === 'text')?.text ?? ''
let parsed
try {
  // Strip markdown fences if Claude added them despite instructions
  const json = rawText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()
  parsed = JSON.parse(json)
} catch (err) {
  console.error('✗ Failed to parse Claude output as JSON:', err.message)
  await writeRunFile(dateISO, 'parse-failed', { rawText, error: err.message })
  process.exit(2)
}

// Validate
const required = ['slug', 'title', 'category', 'tags', 'summary', 'article_markdown', 'linkedin', 'twitter']
const missing = required.filter((k) => !parsed[k])
if (missing.length) {
  console.error('✗ Missing fields:', missing.join(', '))
  await writeRunFile(dateISO, 'invalid-schema', { parsed, missing })
  process.exit(3)
}

// Avoid slug collision
const slug = parsed.slug.replace(/[^a-z0-9-]/g, '').slice(0, 80)
const blogPath = path.join(ROOT, 'content/blog', `${slug}.md`)
const socialPath = path.join(ROOT, 'content/social', `${slug}.json`)
try {
  await fs.access(blogPath)
  console.error(`✗ Slug collision: ${slug} already exists.`)
  await writeRunFile(dateISO, 'collision', { slug })
  process.exit(4)
} catch { /* doesn't exist — good */ }

// Write blog markdown with frontmatter
const fm = `---
slug: ${slug}
title: "${parsed.title.replace(/"/g, '\\"')}"
date: "${dateISO}"
category: "${parsed.category}"
tags: [${parsed.tags.map((t) => `"${t}"`).join(', ')}]
summary: "${parsed.summary.replace(/"/g, '\\"')}"
sources: ${JSON.stringify(parsed.sources_used ?? [])}
---

`
await fs.writeFile(blogPath, fm + parsed.article_markdown.trim() + '\n')
console.log(`  ✓ wrote ${path.relative(ROOT, blogPath)}`)

// Write social companion
const social = {
  post: slug,
  linkedin: {
    hook: parsed.linkedin.hook,
    body: parsed.linkedin.body,
    cta: parsed.linkedin.cta,
    link: `https://www.viox.ai/blog/${slug}`,
    hashtags: parsed.linkedin.hashtags ?? ['#AgenticAI', '#AppliedAI', '#VioX'],
  },
  twitter: { thread: parsed.twitter.thread },
}
await fs.writeFile(socialPath, JSON.stringify(social, null, 2))
console.log(`  ✓ wrote ${path.relative(ROOT, socialPath)}`)

// Append to topic memory
const articleThemes = extractThemes(parsed.title + '\n' + parsed.article_markdown)
appendPost(topicIndex, { slug, date: dateISO, title: parsed.title, themes: articleThemes })
await fs.writeFile(
  path.join(ROOT, '.blog-runs/topics-index.json'),
  JSON.stringify(topicIndex, null, 2),
)
console.log(`  ✓ topic memory updated (themes: ${articleThemes.join(', ') || 'none-extracted'})`)

// Audit run
await writeRunFile(dateISO, slug, {
  slug, category, model: MODEL,
  signals_count: candidatePool.length,
  signal_sources: [...new Set(candidatePool.map((s) => s.source))],
  usage: response.usage,
  elapsed_sec: parseFloat(elapsedSec),
  themes: articleThemes,
  coverage_before: coverage,
})

console.log(`\n✓ Generated: /blog/${slug}\n`)

// ---------- Helpers ----------

function categoryToTopicKey(cat) {
  return {
    'Frontier': 'frontier',
    'Stack': 'stack',
    'Field notes': 'stack',
    'Briefings': 'frontier',
  }[cat] ?? 'frontier'
}

function categoryGuidance(cat) {
  return {
    'Frontier': 'Stories about new model releases, papers, capability shifts, the AI labs.',
    'Stack': 'Tooling, architecture, infrastructure, agentic patterns. Vercel, Cloudflare, LangChain, LangGraph, Pinecone, etc.',
    'Field notes': 'Production lessons, debugging stories, real client patterns. Reference VioX OS, Goldie, Jordan, DreamersJoy if relevant.',
    'Briefings': 'Aggregate the week — pick 5-7 of the strongest signals across both Frontier and Stack categories.',
  }[cat] ?? ''
}

async function loadExemplarTitles() {
  const dir = path.join(ROOT, 'content/blog')
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'))
  const titles = []
  for (const f of files) {
    const raw = await fs.readFile(path.join(dir, f), 'utf8')
    const m = raw.match(/^title:\s*"([^"]+)"/m)
    if (m) titles.push(m[1])
  }
  return titles.slice(0, 6)
}

async function loadRecentSlugs() {
  const dir = path.join(ROOT, 'content/blog')
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'))
  return files.map((f) => f.replace(/\.md$/, ''))
}

async function writeRunFile(date, label, data) {
  const dir = path.join(ROOT, '.blog-runs')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(
    path.join(dir, `${date}-${label}.json`),
    JSON.stringify(data, null, 2),
  )
}
