import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import PricingTabs from '@/components/PricingTabs'
import CTABanner from '@/components/CTABanner'
import { pricingGraph, breadcrumbs } from '@/lib/jsonld'

export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing — VioX AI"
        description="Transparent pricing across VioX OS, AI services, cinematic / 3D builds, and ongoing engagements."
        path="/pricing"
        image="/og/pricing.png"
        jsonLd={[
          pricingGraph(),
          { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }]) },
        ]}
      />
      <PageHeader
        eyebrow="Pricing"
        title="Three modes. Real numbers."
        subtitle="No pilot fees. Productized OS pricing, fixed-price builds for new work, monthly retainers for ongoing operations."
      />
      <PricingTabs />
      <CTABanner />
    </>
  )
}
