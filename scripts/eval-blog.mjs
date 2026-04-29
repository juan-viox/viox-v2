#!/usr/bin/env node
/**
 * Quality gates for a generated blog draft.
 *
 * Three gates:
 *   1. Slop detector — banned phrases, length bounds (deterministic, no LLM)
 *   2. Voice judge — Claude scores draft against the rubric (0-70)
 *   3. (skipped: factuality is enforced by the generator citing only inbound source URLs)
 *
 * Usage:
 *   node scripts/eval-blog.mjs <slug>
 *
 * Exit codes:
 *   0 — all gates pass; article stays in content/blog/
 *   1 — slop detector failed
 *   2 — voice judge failed
 *   3 — usage error
 *
 * On failure, the article + companion are moved to _drafts/ subdirectories
 * and a JSON report is written to .blog-runs/.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node scripts/eval-blog.mjs <slug>')
  process.exit(3)
}

const blogPath = path.join(ROOT, 'content/blog', `${slug}.md`)
const socialPath = path.join(ROOT, 'content/social', `${slug}.json`)

let raw
try { raw = await fs.readFile(blogPath, 'utf8') }
catch { console.error(`✗ Not found: ${blogPath}`); process.exit(3) }

const fmEnd = raw.indexOf('---', 4)
const body = raw.slice(fmEnd + 3).trim()

// ---------- Gate 1: Slop detector (deterministic) ----------

const BANNED = [
  /\brevolutionary\b/i,
  /\bgame-?changing\b/i,
  /\bunleash(ing)?\b/i,
  /\bdive deep\b/i,
  /\bin today's fast-?paced\b/i,
  /\bthe rise of\b/i,
  /\bwe're excited to announce\b/i,
  /\bit's no secret that\b/i,
  /\bunlock the power of\b/i,
  /\bharness(ing)?\s+(the )?power\b/i,
  /\bleverage AI to\b/i,
  /\btransform your business\b/i,
  /\bthe future is here\b/i,
  /\bbuckle up\b/i,
  /\blet's explore\b/i,
  /\b(in conclusion|to summarize|to conclude)\b/i,
]

const slopHits = []
for (const re of BANNED) {
  const m = body.match(re)
  if (m) slopHits.push(m[0])
}

const wordCount = body.split(/\s+/).filter(Boolean).length

console.log(`→ Slop detector`)
console.log(`  word count: ${wordCount} ${wordCount < 600 ? '(too short)' : wordCount > 1500 ? '(too long)' : '✓'}`)
console.log(`  banned phrases: ${slopHits.length === 0 ? '✓ none' : '✗ ' + slopHits.join(', ')}`)

if (slopHits.length > 0 || wordCount < 600 || wordCount > 1600) {
  await fail(1, {
    gate: 'slop',
    slopHits,
    wordCount,
  })
}

// ---------- Gate 2: Voice judge ----------

const voiceSpec = await fs.readFile(path.join(__dirname, 'brand-voice.md'), 'utf8')
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

console.log(`→ Voice judge`)

const judgeResp = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1500,
  system: [
    {
      type: 'text',
      text: `You are a strict editor judging whether an article matches the VioX AI brand voice. Score the article on 7 dimensions per the rubric. Return ONLY JSON, no commentary.

${voiceSpec}`,
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    {
      role: 'user',
      content: `Score this article (0-10 each dimension, integer only):

DRAFT:
"""
${body}
"""

Return JSON exactly:
{
  "specificity": <0-10>,
  "numbered_specifics": <0-10>,
  "em_dash_rhythm": <0-10>,
  "opinion_strength": <0-10>,
  "action_close": <0-10>,
  "banned_phrases": <0-10>,
  "paragraph_length": <0-10>,
  "total": <sum>,
  "verdict": "pass"|"fail",
  "feedback": "1-3 sentences of specific actionable feedback"
}

Pass: total ≥ 42. Fail: < 42.`,
    },
  ],
})

let judgement
try {
  const text = judgeResp.content.find((c) => c.type === 'text')?.text ?? ''
  judgement = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim())
} catch (err) {
  console.error('✗ Voice judge returned invalid JSON:', err.message)
  await fail(2, { gate: 'voice', error: 'judge-parse-failed', raw: judgeResp.content })
}

console.log(`  scores: spec=${judgement.specificity} nums=${judgement.numbered_specifics} dash=${judgement.em_dash_rhythm} opin=${judgement.opinion_strength} action=${judgement.action_close} banned=${judgement.banned_phrases} para=${judgement.paragraph_length}`)
console.log(`  total: ${judgement.total}/70 — ${judgement.verdict}`)
console.log(`  feedback: ${judgement.feedback}`)

if (judgement.verdict !== 'pass' || judgement.total < 42) {
  await fail(2, { gate: 'voice', judgement })
}

// ---------- Pass ----------

const date = new Date().toISOString().slice(0, 10)
await writeRunFile(date, `${slug}-eval-pass`, {
  slug,
  wordCount,
  slopHits: [],
  voice: judgement,
})

console.log(`\n✓ All gates passed for /blog/${slug}\n`)
process.exit(0)

// ---------- Helpers ----------

async function fail(code, report) {
  const date = new Date().toISOString().slice(0, 10)
  console.error(`\n✗ Gate failed: ${report.gate}`)

  // Move article + social to _drafts/
  const draftBlogDir = path.join(ROOT, 'content/blog/_drafts')
  const draftSocialDir = path.join(ROOT, 'content/social/_drafts')
  await fs.mkdir(draftBlogDir, { recursive: true })
  await fs.mkdir(draftSocialDir, { recursive: true })

  try { await fs.rename(blogPath, path.join(draftBlogDir, `${slug}.md`)) } catch {}
  try { await fs.rename(socialPath, path.join(draftSocialDir, `${slug}.json`)) } catch {}

  await writeRunFile(date, `${slug}-eval-fail`, report)
  console.error(`  → moved to _drafts/`)
  process.exit(code)
}

async function writeRunFile(date, label, data) {
  const dir = path.join(ROOT, '.blog-runs')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(
    path.join(dir, `${date}-${label}.json`),
    JSON.stringify(data, null, 2),
  )
}
