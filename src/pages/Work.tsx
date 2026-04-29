import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import CaseStudiesGrid from '@/components/CaseStudiesGrid'
import CTABanner from '@/components/CTABanner'
import { workGraph, breadcrumbs } from '@/lib/jsonld'

export default function Work() {
  return (
    <>
      <SEO
        title="Work — VioX AI"
        description="Selected work across agentic systems, AI-first cloud platforms, workflow automation, and cinematic websites."
        path="/work"
        image="/og/work.png"
        jsonLd={[
          workGraph(),
          { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Work', path: '/work' }]) },
        ]}
      />
      <PageHeader
        eyebrow="Work"
        title="Eight projects, eight different industries."
        subtitle="From boutique floral studios to commercial print houses to physician associations — applied AI looks different in every business. Here's what we've shipped."
      />
      <CaseStudiesGrid heading="All projects." />
      <CTABanner />
    </>
  )
}
