/**
 * JSON-LD structured data builders.
 * Schema.org-compliant. Used per page via the SEO component's jsonLd prop
 * and emitted into <head> at SSG time.
 */

import { CASE_STUDIES, type CaseStudy } from '@/config/case-studies'
import { SOLUTIONS, type Solution } from '@/config/services'
import { PRICING, type PricingTier } from '@/config/pricing'

const SITE = 'https://www.viox.ai'
const ORG_REF = { '@id': `${SITE}#organization` }

/** Reusable Organization node — referenced via @id from other graphs. */
export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${SITE}#organization`,
    name: 'VioX AI',
    alternateName: 'VioX',
    url: SITE,
    logo: `${SITE}/viox-logo-full.png`,
    description:
      'Frontier AI agency. Agentic systems, AI-first cloud platforms, workflow automation, and cinematic websites.',
    foundingDate: '2018',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    areaServed: 'US',
    sameAs: [],
  }
}

/** WebSite node with SearchAction — helps Google show sitelinks. */
export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}#website`,
    url: SITE,
    name: 'VioX AI',
    publisher: ORG_REF,
    inLanguage: 'en-US',
  }
}

/** BreadcrumbList — boosts SERP breadcrumb display. */
export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  }
}

/** ProfessionalService graph for the home page. */
export function homeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode(),
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE}#service`,
        name: 'VioX AI',
        url: SITE,
        image: `${SITE}/logo-x.png`,
        priceRange: '$$$',
        areaServed: 'US',
        provider: ORG_REF,
        serviceType: SOLUTIONS.map((s) => s.name),
        description:
          'Agentic systems, AI-first cloud platforms, workflow automation, and AI-first websites.',
      },
    ],
  }
}

/** Service ItemList for /services. */
export function servicesGraph() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Services offered by VioX AI',
    itemListElement: SOLUTIONS.map((s: Solution, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.name,
        description: s.description,
        provider: ORG_REF,
        serviceType: s.name,
        areaServed: 'US',
        url: `${SITE}/services#${s.slug}`,
      },
    })),
  }
}

/** OfferCatalog for /pricing — eligible for SERP rich snippets. */
export function pricingGraph() {
  const groups = new Map<string, PricingTier[]>()
  PRICING.forEach((p) => {
    const arr = groups.get(p.tab) ?? []
    arr.push(p)
    groups.set(p.tab, arr)
  })

  const labels: Record<string, string> = {
    os: 'VioX OS',
    ai: 'AI Services',
    cinematic: 'Cinematic / 3D',
    ongoing: 'Ongoing',
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'VioX AI pricing',
    url: `${SITE}/pricing`,
    itemListElement: Array.from(groups.entries()).map(([tab, tiers]) => ({
      '@type': 'OfferCatalog',
      name: labels[tab] ?? tab,
      itemListElement: tiers.map((t) => {
        // Extract numeric price for structured data when possible.
        const numeric = (t.price.match(/[\d,]+/)?.[0] ?? '').replace(/,/g, '')
        return {
          '@type': 'Offer',
          name: t.name,
          description: t.blurb,
          url: `${SITE}${t.ctaHref}`,
          ...(numeric && { price: numeric, priceCurrency: 'USD' }),
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: numeric || t.price,
            priceCurrency: 'USD',
          },
          seller: ORG_REF,
        }
      }),
    })),
  }
}

/** ItemList of case studies for /work. */
export function workGraph() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Selected work — VioX AI',
    url: `${SITE}/work`,
    itemListElement: CASE_STUDIES.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/work/${c.slug}`,
      name: c.name,
      item: caseStudyNode(c, false),
    })),
  }
}

/** CreativeWork node for an individual case study. */
export function caseStudyNode(c: CaseStudy, includeContext = true) {
  return {
    ...(includeContext && { '@context': 'https://schema.org' }),
    '@type': 'CreativeWork',
    name: c.name,
    headline: c.headline,
    description: c.description,
    url: c.liveUrl ?? `${SITE}/work/${c.slug}`,
    creator: ORG_REF,
    dateCreated: c.year,
    keywords: c.services.join(', '),
    locationCreated: {
      '@type': 'Place',
      name: c.location,
    },
    about: c.industry,
  }
}

/** ContactPage + ContactPoint for /contact. */
export function contactGraph() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE}/contact`,
    name: 'Contact VioX AI',
    mainEntity: {
      ...organizationNode(),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: 'hello@viox.ai',
          contactType: 'sales',
          areaServed: 'US',
          availableLanguage: ['en'],
        },
      ],
    },
  }
}

/** AboutPage. */
export function aboutGraph() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE}/about`,
    name: 'About VioX AI',
    mainEntity: organizationNode(),
  }
}
