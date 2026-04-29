/**
 * SSG pipeline for viox-v2.
 * Runs after `vite build` (client) + `vite build --ssr` (server).
 *   1. Read dist/index.html as the shell template
 *   2. Walk static + dynamic routes (case studies, blog posts)
 *   3. For each route, call render(url) → html + helmet head
 *   4. Inject + write dist/<route>/index.html
 *   5. Generate sitemap.xml + robots.txt + feed.xml
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const ssrDir = path.join(__dirname, 'dist-ssr')

const SITE_URL = 'https://www.viox.ai'

// ---------- Source parsers ----------

function parseCaseStudies(txt) {
  const out = []
  const re = /\{\s*slug:\s*(?:'([^']+)'|"([^"]+)")/g
  let m
  while ((m = re.exec(txt))) out.push(m[1] ?? m[2])
  return out
}

function parseBlogFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const fm = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/)
    if (kv) fm[kv[1]] = kv[2]
  }
  return fm
}

const caseTxt = await fs.readFile(path.join(__dirname, 'src/config/case-studies.ts'), 'utf8')
const caseSlugs = parseCaseStudies(caseTxt)

// Blog posts
const blogDir = path.join(__dirname, 'content/blog')
const blogFiles = (await fs.readdir(blogDir).catch(() => []))
  .filter((f) => f.endsWith('.md'))

const blogPosts = []
for (const f of blogFiles) {
  const raw = await fs.readFile(path.join(blogDir, f), 'utf8')
  const fm = parseBlogFrontmatter(raw)
  if (!fm) continue
  blogPosts.push({
    slug: fm.slug ?? f.replace(/\.md$/, ''),
    title: fm.title ?? f,
    date: fm.date ?? new Date().toISOString().split('T')[0],
    summary: fm.summary ?? '',
    category: fm.category ?? 'Frontier',
  })
}
// Newest first
blogPosts.sort((a, b) => b.date.localeCompare(a.date))

// ---------- Routes ----------

const staticRoutes = [
  { path: '/',         priority: 1.0, changefreq: 'weekly' },
  { path: '/services', priority: 0.9, changefreq: 'monthly' },
  { path: '/work',     priority: 0.9, changefreq: 'monthly' },
  { path: '/pricing',  priority: 0.8, changefreq: 'monthly' },
  { path: '/about',    priority: 0.6, changefreq: 'monthly' },
  { path: '/contact',  priority: 0.7, changefreq: 'yearly'  },
  { path: '/blog',     priority: 0.9, changefreq: 'daily'   },
]

const caseRoutes = caseSlugs.map((slug) => ({
  path: `/work/${slug}`,
  priority: 0.7,
  changefreq: 'yearly',
}))

const blogRoutes = blogPosts.map((p) => ({
  path: `/blog/${p.slug}`,
  priority: 0.8,
  changefreq: 'monthly',
  lastmod: p.date,
}))

const routes = [...staticRoutes, ...caseRoutes, ...blogRoutes]

// ---------- Prerender ----------

const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
const { render } = await import(url.pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

console.log('\n→ Prerendering routes\n')

let totalSize = 0
for (const route of routes) {
  const { html, head } = render(route.path)
  const filled = template
    .replace('<!--app-html-->', html)
    .replace('<!--app-head-->', head)

  const filePath = route.path === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.path, 'index.html')

  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, filled)

  const sizeKb = filled.length / 1024
  totalSize += sizeKb
  console.log(`  ✓ ${route.path.padEnd(46)} ${sizeKb.toFixed(1)} kB`)
}

console.log(`\n  ${routes.length} routes · ${totalSize.toFixed(0)} kB total`)

// ---------- sitemap.xml ----------

const today = new Date().toISOString().split('T')[0]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url>
    <loc>${SITE_URL}${r.path === '/' ? '' : r.path}</loc>
    <lastmod>${r.lastmod ?? today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`
await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap)
console.log(`  ✓ sitemap.xml          (${routes.length} URLs)`)

// ---------- robots.txt ----------

const robots = `User-agent: *
Allow: /

Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`
await fs.writeFile(path.join(distDir, 'robots.txt'), robots)
console.log('  ✓ robots.txt')

// ---------- feed.xml (Atom RSS) ----------

function xmlEscape(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[c]))
}

const updated = blogPosts[0]?.date ?? today
const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>VioX AI Blog</title>
  <subtitle>Frontier AI dispatches from VioX.</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self"/>
  <link href="${SITE_URL}/blog"/>
  <id>${SITE_URL}/blog</id>
  <updated>${updated}T00:00:00Z</updated>
  <author><name>VioX AI</name><uri>${SITE_URL}</uri></author>
${blogPosts.map((p) => `  <entry>
    <title>${xmlEscape(p.title)}</title>
    <link href="${SITE_URL}/blog/${p.slug}"/>
    <id>${SITE_URL}/blog/${p.slug}</id>
    <published>${p.date}T00:00:00Z</published>
    <updated>${p.date}T00:00:00Z</updated>
    <summary>${xmlEscape(p.summary)}</summary>
    <category term="${xmlEscape(p.category)}"/>
  </entry>`).join('\n')}
</feed>
`
await fs.writeFile(path.join(distDir, 'feed.xml'), feed)
console.log(`  ✓ feed.xml             (${blogPosts.length} entries)`)

// ---------- /social/*.json — companion social copy, public for n8n to fetch ----------

const socialDir = path.join(__dirname, 'content/social')
const socialDistDir = path.join(distDir, 'social')
await fs.mkdir(socialDistDir, { recursive: true })
const socialFiles = (await fs.readdir(socialDir).catch(() => [])).filter((f) => f.endsWith('.json'))
for (const f of socialFiles) {
  await fs.copyFile(path.join(socialDir, f), path.join(socialDistDir, f))
}
// Index file — list of all social JSONs so n8n can iterate
const socialIndex = {
  posts: blogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: p.category,
    blog_url: `${SITE_URL}/blog/${p.slug}`,
    social_url: `${SITE_URL}/social/${p.slug}.json`,
    og_image: `${SITE_URL}/og/blog-${p.slug}.png`,
  })),
}
await fs.writeFile(path.join(socialDistDir, 'index.json'), JSON.stringify(socialIndex, null, 2))
console.log(`  ✓ /social/             (${socialFiles.length} companions + index.json)`)

console.log('\n✓ SSG complete\n')
