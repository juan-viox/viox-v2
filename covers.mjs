/**
 * Per-platform cover/banner generator.
 * Same satori + resvg pipeline as og.mjs, different aspect ratios + layouts.
 *
 * Output: dist/covers/<platform>.png
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const coversDir = path.join(distDir, 'covers')
await fs.mkdir(coversDir, { recursive: true })

// Embed logo
const logoBytes = await fs.readFile(path.join(__dirname, 'public/logo-mark-256.png'))
const LOGO_DATA_URL = `data:image/png;base64,${logoBytes.toString('base64')}`

// Fonts (same as og.mjs)
async function fetchFont(weight) {
  const res = await fetch(`https://api.fontsource.org/v1/fonts/plus-jakarta-sans/latin-${weight}-normal.ttf`)
  if (!res.ok) throw new Error(`font ${weight} ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
console.log('→ Fetching fonts...')
const [reg, semi, bold, black] = await Promise.all([fetchFont(400), fetchFont(600), fetchFont(700), fetchFont(800)])
const fonts = [
  { name: 'Jakarta', data: reg, weight: 400, style: 'normal' },
  { name: 'Jakarta', data: semi, weight: 600, style: 'normal' },
  { name: 'Jakarta', data: bold, weight: 700, style: 'normal' },
  { name: 'Jakarta', data: black, weight: 800, style: 'normal' },
]

const PLATFORMS = [
  { name: 'linkedin',    width: 1584, height: 396,  layout: 'horizontal' },
  { name: 'facebook',    width: 1640, height: 624,  layout: 'standard' },
  { name: 'twitter',     width: 1500, height: 500,  layout: 'standard' },
  { name: 'bluesky',     width: 3000, height: 1000, layout: 'standard' },
  { name: 'youtube',     width: 2560, height: 1440, layout: 'standard' },
]

function template({ width, height, layout }) {
  const isWide = layout === 'horizontal' // LinkedIn-style narrow strip
  const logoSize = Math.round(height * (isWide ? 0.55 : 0.40))
  const wordmarkSize = Math.round(height * (isWide ? 0.30 : 0.16))
  const taglineSize = Math.round(height * (isWide ? 0.10 : 0.055))
  const dotSize = Math.round(height * 0.014)
  const padding = Math.round(height * 0.18)

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: `${width}px`,
        height: `${height}px`,
        background:
          'radial-gradient(ellipse at 25% 35%, rgba(80, 35, 130, 0.55) 0%, transparent 55%), ' +
          'radial-gradient(ellipse at 80% 75%, rgba(15, 75, 110, 0.45) 0%, transparent 55%), ' +
          'linear-gradient(135deg, #0A0814 0%, #0F0A1E 50%, #050309 100%)',
        position: 'relative',
        padding: `${padding}px`,
        alignItems: 'center',
        gap: `${Math.round(height * 0.06)}px`,
        fontFamily: 'Jakarta',
        color: '#F4F2F7',
        overflow: 'hidden',
      },
      children: [
        // Subtle grid motif behind everything
        {
          type: 'img',
          props: {
            src: `data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#67E8F9" stroke-opacity="0.05" stroke-width="1"/></pattern></defs><rect width="${width}" height="${height}" fill="url(%23g)"/></svg>`.replace(/%23/g, '#')
            )}`,
            width,
            height,
            style: { position: 'absolute', top: 0, left: 0, width: `${width}px`, height: `${height}px`, opacity: 0.55 },
          },
        },
        // Logo X mark
        {
          type: 'img',
          props: {
            src: LOGO_DATA_URL,
            width: logoSize,
            height: logoSize,
            style: { width: `${logoSize}px`, height: `${logoSize}px`, borderRadius: `${Math.round(logoSize * 0.10)}px`, objectFit: 'contain', flexShrink: 0 },
          },
        },
        // Center column: wordmark + tagline
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: `${Math.round(height * 0.04)}px` },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'baseline', fontSize: wordmarkSize, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1 },
                  children: [
                    { type: 'span', props: { style: { color: '#FFFFFF' }, children: 'Vio' } },
                    { type: 'span', props: { style: { color: '#A78BFA' }, children: 'X' } },
                    { type: 'span', props: { style: { color: '#F4F2F7', opacity: 0.7, fontWeight: 600, marginLeft: `${Math.round(wordmarkSize * 0.15)}px` }, children: 'AI' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: taglineSize, fontWeight: 500, color: 'rgba(244,242,247,0.78)', letterSpacing: '-0.005em', maxWidth: `${Math.round(width * 0.65)}px` },
                  children: 'Frontier AI · Agentic Systems · Cloud-First',
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: `${Math.round(height * 0.025)}px`, marginTop: `${Math.round(height * 0.02)}px` },
                  children: [
                    { type: 'div', props: { style: { width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '999px', background: '#22D3EE' }, children: '' } },
                    { type: 'div', props: { style: { fontFamily: 'Jakarta', fontSize: Math.round(taglineSize * 0.85), fontWeight: 600, color: 'rgba(244,242,247,0.85)', letterSpacing: '0.06em' }, children: 'viox.ai' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }
}

console.log('\n→ Rendering covers')
for (const p of PLATFORMS) {
  const svg = await satori(template(p), { width: p.width, height: p.height, fonts })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: p.width } }).render().asPng()
  await fs.writeFile(path.join(coversDir, `${p.name}.png`), png)
  console.log(`  ✓ covers/${p.name}.png ${p.width}x${p.height} (${(png.length / 1024).toFixed(0)} kB)`)
}
console.log(`\n✓ ${PLATFORMS.length} covers generated\n`)
