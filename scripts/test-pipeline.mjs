#!/usr/bin/env node
/**
 * Dry-run the daily pipeline locally.
 * Tests:
 *   1. RSS sources are reachable + parseable
 *   2. brand-voice.md loads
 *   3. ANTHROPIC_API_KEY is set
 *   4. (optional) Mini Claude call to verify auth works
 *
 * Does NOT generate or commit anything. Use for setup verification.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { ingest } from './lib/sources.mjs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const checks = []

console.log('→ Pipeline pre-flight\n')

// 1. Voice spec loads
try {
  const voice = await fs.readFile(path.join(__dirname, 'brand-voice.md'), 'utf8')
  checks.push({ name: 'brand-voice.md', ok: voice.length > 1000, detail: `${voice.length} chars` })
} catch (e) {
  checks.push({ name: 'brand-voice.md', ok: false, detail: e.message })
}

// 2. Sources file
try {
  const sources = JSON.parse(await fs.readFile(path.join(__dirname, 'sources.json'), 'utf8'))
  checks.push({ name: 'sources.json', ok: sources.sources?.length > 0, detail: `${sources.sources.length} feeds` })
} catch (e) {
  checks.push({ name: 'sources.json', ok: false, detail: e.message })
}

// 3. ANTHROPIC_API_KEY
checks.push({
  name: 'ANTHROPIC_API_KEY',
  ok: !!process.env.ANTHROPIC_API_KEY,
  detail: process.env.ANTHROPIC_API_KEY ? '(set)' : 'NOT SET — set this in env or GitHub secrets',
})

// 4. RSS reachability — sample 3 sources
console.log()
const sources = JSON.parse(await fs.readFile(path.join(__dirname, 'sources.json'), 'utf8'))
const sample = sources.sources.slice(0, 5)
const signals = await ingest(sample, { maxHours: 168, topN: 10 })
checks.push({
  name: 'RSS reachability (5-source sample)',
  ok: signals.length >= 3,
  detail: `${signals.length} fresh items collected`,
})

// 5. Optional: Claude API ping (only if --live flag)
if (process.argv.includes('--live') && process.env.ANTHROPIC_API_KEY) {
  console.log()
  console.log('→ Claude API ping...')
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const t0 = Date.now()
    const r = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 30,
      messages: [{ role: 'user', content: 'Reply with the single word: ready.' }],
    })
    const ms = Date.now() - t0
    const txt = r.content.find((c) => c.type === 'text')?.text?.trim() ?? '(empty)'
    checks.push({ name: 'Claude API', ok: txt.toLowerCase().includes('ready'), detail: `"${txt}" in ${ms}ms` })
  } catch (e) {
    checks.push({ name: 'Claude API', ok: false, detail: e.message })
  }
}

// Report
console.log('\n→ Results\n')
for (const c of checks) {
  console.log(`  ${c.ok ? '✓' : '✗'} ${c.name.padEnd(36)} ${c.detail}`)
}

const failures = checks.filter((c) => !c.ok)
if (failures.length) {
  console.error(`\n✗ ${failures.length} check(s) failed.\n`)
  process.exit(1)
} else {
  console.log('\n✓ Pipeline ready. Run with: node scripts/generate-blog.mjs\n')
}
