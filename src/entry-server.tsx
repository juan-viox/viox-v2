import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'

export interface RenderResult {
  /** App body HTML (with helmet-managed tags already extracted). */
  html: string
  /** Tags that belong in <head>, ready to inject at <!--app-head-->. */
  head: string
}

/**
 * Tags that Helmet emits which must live in <head>, not <body>.
 * react-helmet-async v3 + React 19 renders them inline in the React tree;
 * we lift them out at SSG time so the prerendered HTML is semantically clean.
 */
const HEAD_TAGS = ['title', 'meta', 'link', 'script[^>]*type="application/ld\\+json"[^>]*']

function extractHeadTags(html: string): { html: string; head: string } {
  const heads: string[] = []
  let body = html

  // <title>...</title>
  body = body.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, (m) => { heads.push(m); return '' })

  // <meta ... />
  body = body.replace(/<meta\b[^>]*\/?>/gi, (m) => { heads.push(m); return '' })

  // <link ... />  (rel="canonical", rel="alternate", etc.)
  body = body.replace(/<link\b[^>]*\/?>/gi, (m) => { heads.push(m); return '' })

  // <script type="application/ld+json">...</script>
  body = body.replace(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    (m) => { heads.push(m); return '' }
  )

  return { html: body, head: heads.join('\n    ') }
}

export function render(_url: string): RenderResult {
  const helmetContext = {}

  const rendered = renderToString(
    <HelmetProvider context={helmetContext}>
      <Router ssrPath={_url}>
        <App />
      </Router>
    </HelmetProvider>
  )

  // react-helmet-async v3 inlines tags into the body — lift them.
  const { html, head } = extractHeadTags(rendered)
  return { html, head }
}
