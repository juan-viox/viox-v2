/**
 * Per-route OG image generator (1200×630 PNG).
 * Renders a branded VioX template via satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG).
 * Output: dist/og/<route-or-slug>.png
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const ogDir = path.join(distDir, 'og')
await fs.mkdir(ogDir, { recursive: true })

// Load the VioX logo mark (cropped X) as a base64 data URL — embedded in every OG image
const logoBytes = await fs.readFile(path.join(__dirname, 'public/logo-mark-256.png'))
const LOGO_DATA_URL = `data:image/png;base64,${logoBytes.toString('base64')}`

// Load Plus Jakarta Sans from Google Fonts.
async function fetchFont(weight) {
  // Use the Plus Jakarta Sans family via fonts.googleapis.com woff2; satori needs a TTF/OTF buffer.
  // Pull the static .ttf from the Google Fonts CDN (api.fontsource is a stable mirror).
  const fontUrl = `https://api.fontsource.org/v1/fonts/plus-jakarta-sans/latin-${weight}-normal.ttf`
  const res = await fetch(fontUrl)
  if (!res.ok) throw new Error(`Font fetch failed (${weight}): ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

console.log('\n→ Fetching fonts...')
const [reg, semi, bold, black] = await Promise.all([
  fetchFont(400), fetchFont(600), fetchFont(700), fetchFont(800),
])
const fonts = [
  { name: 'Jakarta', data: reg, weight: 400, style: 'normal' },
  { name: 'Jakarta', data: semi, weight: 600, style: 'normal' },
  { name: 'Jakarta', data: bold, weight: 700, style: 'normal' },
  { name: 'Jakarta', data: black, weight: 800, style: 'normal' },
]

function parseCaseStudies(txt) {
  // Match a quoted string with either ' or " and capture the inner text.
  const Q = `(?:'([^']+)'|"([^"]+)")`
  const re = new RegExp(
    `\\{\\s*slug:\\s*${Q},[\\s\\S]*?name:\\s*${Q},[\\s\\S]*?headline:\\s*${Q},[\\s\\S]*?metric:\\s*${Q},[\\s\\S]*?metricLabel:\\s*${Q}`,
    'g',
  )
  const out = []
  let m
  while ((m = re.exec(txt))) {
    // Each field has 2 capture slots (single or double quoted) — pick whichever matched.
    const pick = (i) => m[i * 2 + 1] ?? m[i * 2 + 2]
    out.push({
      slug:        pick(0),
      name:        pick(1),
      headline:    pick(2),
      metric:      pick(3),
      metricLabel: pick(4),
    })
  }
  return out
}

const caseTxt = await fs.readFile(path.join(__dirname, 'src/config/case-studies.ts'), 'utf8')
const CASE_STUDIES = parseCaseStudies(caseTxt)

/** Per-category visual identity. Each category gets a distinct background + accent. */
const CATEGORY_THEMES = {
  Frontier: {
    background: 'linear-gradient(135deg, #0A0816 0%, #1A0E2E 50%, #06243A 100%)',
    accent: '#67E8F9',
    eyebrowColor: '#67E8F9',
    motif: 'grid',
  },
  Stack: {
    background: 'linear-gradient(135deg, #0F0A1E 0%, #1B1437 60%, #2D1B4E 100%)',
    accent: '#A78BFA',
    eyebrowColor: '#A78BFA',
    motif: 'hex',
  },
  'Field notes': {
    background: 'linear-gradient(135deg, #1A0E0A 0%, #2A1A0E 50%, #1F140A 100%)',
    accent: '#FBBF24',
    eyebrowColor: '#FBBF24',
    motif: 'lines',
  },
  Briefings: {
    background: 'radial-gradient(ellipse at top left, #1A0E2E 0%, #0F0A1E 50%, #0A0814 100%)',
    accent: '#F472B6',
    eyebrowColor: '#F472B6',
    motif: 'mesh',
  },
  default: {
    background: 'linear-gradient(135deg, #0F0A1E 0%, #1A0E2E 60%, #0A0814 100%)',
    accent: '#A78BFA',
    eyebrowColor: '#67E8F9',
    motif: null,
  },
}

/** Decorative SVG motif rendered as a positioned div with inline SVG content. */
function motifNode(kind, accent) {
  if (!kind) return null
  // Use a thin svg pattern — SVG inside an img src is the satori-friendly approach.
  const svgs = {
    grid: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${accent}" stroke-opacity="0.08" stroke-width="1"/></pattern></defs><rect width="600" height="600" fill="url(%23g)"/></svg>`,
    hex: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><g fill="none" stroke="${accent}" stroke-opacity="0.10" stroke-width="1"><polygon points="250,40 380,115 380,265 250,340 120,265 120,115"/><polygon points="250,140 320,180 320,260 250,300 180,260 180,180"/></g></svg>`,
    lines: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><g stroke="${accent}" stroke-opacity="0.12" stroke-width="1"><line x1="0" y1="100" x2="600" y2="100"/><line x1="0" y1="200" x2="600" y2="200"/><line x1="0" y1="300" x2="600" y2="300"/><line x1="0" y1="400" x2="600" y2="400"/><line x1="0" y1="500" x2="600" y2="500"/></g></svg>`,
    mesh: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><radialGradient id="r" cx="0.3" cy="0.3"><stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect width="600" height="600" fill="url(%23r)"/></svg>`,
  }
  const svg = svgs[kind]
  if (!svg) return null
  return {
    type: 'img',
    props: {
      src: `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/%23/g, '#'))}`,
      width: 600,
      height: 600,
      style: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '600px',
        height: '630px',
        opacity: 0.55,
        zIndex: 0,
      },
    },
  }
}

/** Card template — pure JSX-as-data (no React import needed at runtime). */
function ogTemplate({ eyebrow, title, subtitle, accent, metric, category = 'default' }) {
  const theme = CATEGORY_THEMES[category] ?? CATEGORY_THEMES.default
  const finalAccent = accent ?? theme.accent
  const motif = motifNode(theme.motif, finalAccent)
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        width: '1200px', height: '630px',
        background: theme.background,
        padding: '72px',
        fontFamily: 'Jakarta',
        color: '#F4F2F7',
        position: 'relative',
      },
      children: [
        ...(motif ? [motif] : []),
        // Top row: brand + eyebrow
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '14px' },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: LOGO_DATA_URL,
                        width: 56,
                        height: 56,
                        style: {
                          width: '56px',
                          height: '56px',
                          borderRadius: '10px',
                          objectFit: 'contain',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'baseline', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
                        children: [
                          { type: 'span', props: { style: { color: '#F4F2F7' }, children: 'Vio' } },
                          { type: 'span', props: { style: { color: '#7C3AED' }, children: 'X' } },
                          { type: 'span', props: { style: { opacity: 0.6, fontWeight: 600, marginLeft: '6px' }, children: 'AI' } },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 16, fontWeight: 600, color: theme.eyebrowColor,
                    textTransform: 'uppercase', letterSpacing: '0.18em',
                  },
                  children: eyebrow,
                },
              },
            ],
          },
        },
        // Middle: title
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '950px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 80, fontWeight: 800, lineHeight: 1.02,
                    letterSpacing: '-0.04em',
                    color: '#FFFFFF',
                  },
                  children: title,
                },
              },
              subtitle && {
                type: 'div',
                props: {
                  style: { fontSize: 26, fontWeight: 500, color: 'rgba(244,242,247,0.72)', lineHeight: 1.4 },
                  children: subtitle,
                },
              },
            ].filter(Boolean),
          },
        },
        // Bottom row: domain + optional metric
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '12px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { width: '8px', height: '8px', borderRadius: '999px', background: '#22D3EE' },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: 18, fontWeight: 600, color: 'rgba(244,242,247,0.85)', letterSpacing: '-0.005em' },
                        children: 'viox.ai',
                      },
                    },
                  ],
                },
              },
              metric && {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'baseline', gap: '12px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: 64, fontWeight: 800, color: accent, letterSpacing: '-0.03em' },
                        children: metric,
                      },
                    },
                  ],
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  }
}

async function renderOG(opts, outName) {
  const svg = await satori(ogTemplate(opts), { width: 1200, height: 630, fonts })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
  await fs.writeFile(path.join(ogDir, `${outName}.png`), png)
  return png.length
}

const STATIC_PAGES = [
  { name: 'home',     opts: { eyebrow: 'Frontier AI Agency', title: 'Agentic by design.\nAI-first. Cloud-first.', subtitle: 'We architect agentic systems and AI-first cloud platforms.' } },
  { name: 'services', opts: { eyebrow: 'Services',  title: 'One product. Four services.', subtitle: 'VioX OS · Agentic Systems · Cloud · Web' } },
  { name: 'work',     opts: { eyebrow: 'Selected work', title: 'Eight projects.\nEight industries.', subtitle: '2018 — present', metric: '08' } },
  { name: 'pricing',  opts: { eyebrow: 'Pricing',   title: 'Three modes.\nReal numbers.', subtitle: 'OS · AI Services · Cinematic · Ongoing' } },
  { name: 'about',    opts: { eyebrow: 'About',     title: 'A frontier AI agency.', subtitle: 'NYC · Founded 2018 · Built to ship.' } },
  { name: 'contact',  opts: { eyebrow: 'Contact',   title: 'Tell us what to ship.', subtitle: 'One business day response · hello@viox.ai' } },
  { name: 'blog',     opts: { eyebrow: 'Blog',       title: 'Frontier AI dispatches\nfrom VioX.', subtitle: 'Agents, evals, voice, cloud — written by operators who ship them.' } },
]

// Parse blog frontmatter
function parseBlogFM(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const fm = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/)
    if (kv) fm[kv[1]] = kv[2]
  }
  return fm
}

const blogDir = path.join(__dirname, 'content/blog')
const blogFiles = (await fs.readdir(blogDir).catch(() => []))
  .filter((f) => f.endsWith('.md'))

const BLOG_POSTS = []
for (const f of blogFiles) {
  const raw = await fs.readFile(path.join(blogDir, f), 'utf8')
  const fm = parseBlogFM(raw)
  if (fm) {
    BLOG_POSTS.push({
      slug: fm.slug ?? f.replace(/\.md$/, ''),
      title: fm.title ?? f,
      summary: fm.summary ?? '',
      category: fm.category ?? 'Frontier',
    })
  }
}

console.log('\n→ Generating OG images')
for (const p of STATIC_PAGES) {
  const bytes = await renderOG(p.opts, p.name)
  console.log(`  ✓ og/${p.name}.png`.padEnd(28), `${(bytes / 1024).toFixed(0)} kB`)
}

const cases = CASE_STUDIES ?? []
for (const c of cases) {
  const bytes = await renderOG({
    eyebrow: 'Case study',
    title: c.name,
    subtitle: c.headline,
    metric: c.metric,
    accent: '#A78BFA',
  }, `work-${c.slug}`)
  console.log(`  ✓ og/work-${c.slug}.png`.padEnd(40), `${(bytes / 1024).toFixed(0)} kB`)
}

for (const p of BLOG_POSTS) {
  const bytes = await renderOG({
    eyebrow: `Blog · ${p.category}`,
    title: p.title,
    subtitle: p.summary,
    category: p.category,
  }, `blog-${p.slug}`)
  console.log(`  ✓ og/blog-${p.slug}.png`.padEnd(50), `${(bytes / 1024).toFixed(0)} kB`)
}

console.log(`\n✓ ${STATIC_PAGES.length + cases.length + BLOG_POSTS.length} OG images generated\n`)
