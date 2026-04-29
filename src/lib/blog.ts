/**
 * Blog content loader.
 * Reads markdown files from /content/blog/*.md at build time via Vite's
 * import.meta.glob. Frontmatter parsed with gray-matter, body rendered
 * with marked. Works in both SSR (during prerender) and client bundles.
 */

import matter from 'gray-matter'
import { marked } from 'marked'

export interface PostFrontmatter {
  slug: string
  title: string
  date: string                       // ISO yyyy-mm-dd
  category: 'Frontier' | 'Stack' | 'Field notes' | 'Briefings'
  tags: string[]
  summary: string
  sources?: { title: string; url: string }[]
  ogImage?: string
}

export interface Post extends PostFrontmatter {
  html: string                       // rendered body
  readingMinutes: number
  excerpt: string                    // first 180 chars of body, plain text
}

// Vite resolves this at build time and inlines the raw markdown of every file.
const RAW = import.meta.glob('/content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

marked.setOptions({ gfm: true, breaks: false })

function parseRaw(filepath: string, raw: string): Post {
  const { data, content } = matter(raw)
  const fm = data as PostFrontmatter

  // Strip markdown for excerpt + reading time calc
  const plain = content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`\[\]\(\)!-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const wordCount = plain.split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.round(wordCount / 220))

  const excerpt = plain.length > 180
    ? plain.slice(0, 180).replace(/\s\S*$/, '') + '…'
    : plain

  // Slug fallback to filename if missing in frontmatter
  const filename = filepath.split('/').pop()!.replace(/\.md$/, '')
  const slug = fm.slug ?? filename

  return {
    ...fm,
    slug,
    html: marked.parse(content) as string,
    readingMinutes,
    excerpt,
  }
}

const ALL: Post[] = Object.entries(RAW)
  .map(([path, raw]) => parseRaw(path, raw))
  // Newest first
  .sort((a, b) => b.date.localeCompare(a.date))

export function allPosts(): Post[] {
  return ALL
}

export function getPost(slug: string): Post | undefined {
  return ALL.find((p) => p.slug === slug)
}

export function postsByCategory(): Record<string, Post[]> {
  const out: Record<string, Post[]> = {}
  for (const p of ALL) {
    out[p.category] = out[p.category] ?? []
    out[p.category].push(p)
  }
  return out
}

export function postsByTag(tag: string): Post[] {
  return ALL.filter((p) => p.tags.includes(tag))
}

/** Format ISO date as "Apr 29, 2026" — locale-stable for SSR/hydration. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}
