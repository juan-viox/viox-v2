#!/usr/bin/env node
/**
 * Weekly voice rubric tuning.
 *
 * Reads the last 30 days of voice-eval reports from .blog-runs/, identifies
 * patterns in top-scoring vs bottom-scoring articles, asks Claude Opus to
 * propose a refined brand-voice.md.
 *
 * Conservative by default: writes the proposed update to brand-voice.proposed.md
 * and opens a PR for human review. Never auto-overwrites the live voice spec.
 *
 * Run weekly via .github/workflows/voice-tune.yml (Sat 12:00 UTC).
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ---------- Collect last 30 days of eval reports + corresponding articles ----------

const runsDir = path.join(ROOT, '.blog-runs')
const reportFiles = (await fs.readdir(runsDir).catch(() => []))
  .filter((f) => f.endsWith('-eval-pass.json') || f.endsWith('-eval-fail.json'))

const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

const samples = []
for (const f of reportFiles) {
  const date = f.slice(0, 10)
  if (date < cutoff) continue

  const slug = f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-eval-(pass|fail)\.json$/, '')
  const passed = f.endsWith('-eval-pass.json')

  let report
  try { report = JSON.parse(await fs.readFile(path.join(runsDir, f), 'utf8')) }
  catch { continue }

  const total = passed ? report.voice?.total : report.judgement?.total
  if (typeof total !== 'number') continue

  // Try to load the article body
  const artPath = passed
    ? path.join(ROOT, 'content/blog', `${slug}.md`)
    : path.join(ROOT, 'content/blog/_drafts', `${slug}.md`)
  let body
  try { body = await fs.readFile(artPath, 'utf8') }
  catch { continue }

  samples.push({ slug, date, score: total, passed, body: body.slice(0, 4000) })
}

if (samples.length < 5) {
  console.log(`→ Only ${samples.length} samples in last 30 days — skipping voice tune.`)
  process.exit(0)
}

samples.sort((a, b) => b.score - a.score)
const top = samples.slice(0, Math.max(3, Math.ceil(samples.length / 3)))
const bottom = samples.slice(-Math.max(3, Math.ceil(samples.length / 3))).reverse()

console.log(`→ Voice tune: ${samples.length} samples, top ${top.length} avg=${avg(top, 'score').toFixed(1)}, bottom ${bottom.length} avg=${avg(bottom, 'score').toFixed(1)}`)

// ---------- Ask Claude Opus to identify patterns + propose updates ----------

const currentVoice = await fs.readFile(path.join(__dirname, 'brand-voice.md'), 'utf8')
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const prompt = `You are tuning the VioX AI brand-voice rubric. You have 30 days of articles each scored against the current rubric (0-70). Your job: identify what the high-scoring articles do better than the low-scoring ones, and propose specific, actionable updates to the rubric.

## Current rubric

${currentVoice}

## Top-scoring articles (avg ${avg(top, 'score').toFixed(1)}/70)

${top.map((s) => `### ${s.slug} (${s.score}/70)
${s.body.split('---').slice(2).join('---').slice(0, 1500)}
`).join('\n---\n')}

## Bottom-scoring articles (avg ${avg(bottom, 'score').toFixed(1)}/70)

${bottom.map((s) => `### ${s.slug} (${s.score}/70)
${s.body.split('---').slice(2).join('---').slice(0, 1500)}
`).join('\n---\n')}

## Your task

Compare top vs bottom. Identify 3-5 specific patterns that distinguish them. Then output an UPDATED brand-voice.md that:
- Keeps the existing structure and identity intact
- Adds 1-3 new MUST or NEVER rules based on what you've learned
- Tightens existing rules with concrete examples drawn from the top articles
- Removes any rules that didn't differentiate (i.e. both groups followed them equally)

Return your response in two parts:

\`\`\`json-analysis
{
  "patterns_found": ["pattern 1", "pattern 2", ...],
  "rule_changes": [
    { "type": "added"|"modified"|"removed", "rule": "...", "rationale": "..." }
  ],
  "summary": "1-2 sentence summary of what changed"
}
\`\`\`

\`\`\`markdown-updated-spec
# VioX AI — Brand Voice Specification
... full updated spec ...
\`\`\``

console.log('→ Calling Claude for analysis...')
const response = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 8000,
  messages: [{ role: 'user', content: prompt }],
})

const text = response.content.find((c) => c.type === 'text')?.text ?? ''

// Extract analysis + proposed spec
const analysisMatch = text.match(/```json-analysis\s*([\s\S]*?)```/)
const specMatch = text.match(/```markdown-updated-spec\s*([\s\S]*?)```/)

if (!analysisMatch || !specMatch) {
  console.error('✗ Could not parse Claude response. Saving raw to .blog-runs/voice-tune-raw.txt')
  await fs.writeFile(path.join(runsDir, 'voice-tune-raw.txt'), text)
  process.exit(1)
}

let analysis
try { analysis = JSON.parse(analysisMatch[1]) }
catch (err) {
  console.error('✗ Analysis JSON parse failed:', err.message)
  process.exit(1)
}

const proposedSpec = specMatch[1].trim()

// Write proposal alongside the existing spec
await fs.writeFile(path.join(__dirname, 'brand-voice.proposed.md'), proposedSpec)
const date = new Date().toISOString().slice(0, 10)
await fs.writeFile(
  path.join(runsDir, `${date}-voice-tune.json`),
  JSON.stringify({ analysis, samples_count: samples.length, top_avg: avg(top, 'score'), bottom_avg: avg(bottom, 'score') }, null, 2),
)

console.log(`\n✓ Voice tune proposal written to scripts/brand-voice.proposed.md`)
console.log(`  ${analysis.summary}`)
console.log(`  Patterns: ${analysis.patterns_found?.length ?? 0}, Rule changes: ${analysis.rule_changes?.length ?? 0}`)
console.log(`\n  Review and rename to brand-voice.md to apply.\n`)

function avg(arr, key) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b[key], 0) / arr.length
}
