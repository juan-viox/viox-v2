import { Helmet } from 'react-helmet-async'

interface Props {
  title: string
  description?: string
  path?: string
  /** OpenGraph image URL — absolute, served from the site or a CDN. */
  image?: string
  /** Optional JSON-LD structured data — emitted as <script type="application/ld+json">. */
  jsonLd?: object | object[]
  /** Page type — defaults to 'website'. Use 'article' for blog posts. */
  type?: 'website' | 'article'
  /** Set true on routes that shouldn't be indexed (drafts, dev, etc.). */
  noindex?: boolean
}

const SITE = 'https://www.viox.ai'
const DEFAULT_IMAGE = `${SITE}/logo-x.png`

export default function SEO({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  jsonLd,
  type = 'website',
  noindex = false,
}: Props) {
  const fullTitle = title.includes('VioX') ? title : `${title} · VioX AI`
  const canonical = `${SITE}${path}`
  const ogImage = image.startsWith('http') ? image : `${SITE}${image}`

  const ldArr = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : []

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* OpenGraph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="VioX AI" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* Structured data (per page) */}
      {ldArr.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  )
}
