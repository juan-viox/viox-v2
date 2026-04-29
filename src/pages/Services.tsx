import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import SolutionsGrid from '@/components/SolutionsGrid'
import AgenticStack from '@/components/AgenticStack'
import CTABanner from '@/components/CTABanner'
import { servicesGraph, breadcrumbs } from '@/lib/jsonld'

export default function Services() {
  return (
    <>
      <SEO
        title="Services — VioX AI"
        description="Agentic systems, AI-first cloud platforms, workflow automation, and AI-first websites."
        path="/services"
        image="/og/services.png"
        jsonLd={[
          servicesGraph(),
          { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]) },
        ]}
      />
      <PageHeader
        eyebrow="Services"
        title="What we architect — and how it integrates with your stack."
        subtitle="Every engagement ends with an agentic system running in production. We architect the reasoning, the cloud platform, and the integrations — end to end."
      />
      <SolutionsGrid />
      <AgenticStack />
      <CTABanner />
    </>
  )
}
